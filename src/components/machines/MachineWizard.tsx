import { useState } from 'react'
import { Alert, Button, Form, InputNumber, Select, Steps } from 'antd'
import { useNavigate } from 'react-router-dom'
import type { Machine, MachineInput, ShelfInput } from '../../types/machine'
import { useAppStore } from '../../stores/useAppStore'
import { machineSlots } from '../../stores/selectors'
import { shelfLabel, slotCode } from '../../services/machineService'
import { useAction } from '../common/ConfirmDialog'
import { MachineForm } from './MachineForm'
import { PaymentFields } from './PaymentConfig'
import { methods } from '../../static/status'
const blankSlot = () => ({ capacity: 10, productId: null })
const blankShelf = () => ({ slots: Array.from({ length: 4 }, blankSlot) })
const emptyMachine: MachineInput = {
  name: '',
  code: '',
  location: '',
  model: '',
  serial: '',
  manager: '',
  methods: ['INTERNAL_CARD', 'BANK_CARD'],
  terminal: '',
  reader: 'OK',
}
export function MachineWizard({ machine }: { machine?: Machine }) {
  const db = useAppStore((s) => s.db)
  const store = useAppStore
  const navigate = useNavigate()
  const { report } = useAction()
  const [step, setStep] = useState(0)
  const [tested, setTested] = useState(false)
  const [draft, setDraft] = useState<MachineInput>(machine ?? emptyMachine)
  const [error, setError] = useState('')
  const [shelves, setShelves] = useState<ShelfInput[]>(() => {
    if (!machine) return Array.from({ length: 3 }, blankShelf)
    const slots = machineSlots(db, machine.id)
    return db.shelves
      .filter((s) => s.machineId === machine.id && slots.some((slot) => slot.shelfId === s.id))
      .sort((a, b) => a.position - b.position)
      .map((s) => ({
        slots: slots
          .filter((slot) => slot.shelfId === s.id)
          .sort((a, b) => a.code.localeCompare(b.code))
          .map(({ capacity, productId }) => ({ capacity, productId })),
      }))
  })
  const steps = ['Thông tin máy', 'Cấu hình kệ', 'Thanh toán', 'Kiểm tra & lưu']
  const go = (next: number) => {
    setError('')
    setTested(false)
    setStep(next)
  }
  const resize = (count: number) =>
    setShelves((previous) => Array.from({ length: count }, (_, i) => previous[i] ?? blankShelf()))
  const changeSlots = (row: number, slots: ShelfInput['slots']) =>
    setShelves((previous) => previous.map((s, index) => (index === row ? { slots } : s)))
  const advance = (values: Partial<MachineInput>) => {
    const next = { ...draft, ...values }
    if (
      step === 0 &&
      db.machines.some(
        (m) =>
          m.id !== machine?.id &&
          [
            m.code.trim().toLowerCase() === next.code.trim().toLowerCase(),
            m.serial.trim().toLowerCase() === next.serial.trim().toLowerCase(),
          ].some(Boolean),
      )
    ) {
      setError('Mã máy hoặc số serial đã tồn tại.')
      return
    }
    setDraft(next)
    go(step + 1)
  }
  const save = () => {
    const actions = store.getState()
    const result = machine
      ? actions.updateMachine(machine.id, draft, shelves)
      : actions.createMachine(draft, shelves)
    const saved = report(result, machine ? 'Đã cập nhật máy' : 'Đã tạo máy')
    if (saved) navigate('/machines/' + saved.id)
    else if (!result.ok) setError(result.message)
  }
  return (
    <section className="panel panel-pad page-stack">
      <Steps current={step} size="small" items={steps.map((title) => ({ title }))} />
      {error && <Alert type="error" showIcon title={error} />}
      {(step === 0 || step === 2) && (
        <Form key={step} layout="vertical" initialValues={draft} onFinish={advance}>
          {step === 0 ? <MachineForm /> : <PaymentFields />}
          <div className="form-submit">
            {step > 0 && <Button onClick={() => go(step - 1)}>Quay lại</Button>}
            <Button type="primary" htmlType="submit">
              Tiếp tục
            </Button>
          </div>
        </Form>
      )}
      {step === 1 && (
        <div>
          <label>
            Số tầng{' '}
            <InputNumber
              aria-label="Số tầng"
              min={1}
              max={10}
              precision={0}
              value={shelves.length}
              onChange={(n) => {
                if (n) resize(n)
              }}
            />
          </label>
          {shelves.map(({ slots }, i) => (
            <section key={i} className="shelf-edit">
              <div className="panel-title">
                <h2>Tầng {shelfLabel(i)}</h2>
                <label>
                  Số ô{' '}
                  <InputNumber
                    aria-label={'Số ô tầng ' + shelfLabel(i)}
                    min={1}
                    max={12}
                    precision={0}
                    value={slots.length}
                    onChange={(n) => {
                      if (n)
                        changeSlots(
                          i,
                          Array.from({ length: n }, (_, j) => slots[j] ?? blankSlot()),
                        )
                    }}
                  />
                </label>
              </div>
              <div className="shelf-edit-slots">
                {slots.map((slot, j) => {
                  const code = slotCode(shelfLabel(i), j)
                  const existing =
                    machine &&
                    db.slots.find((s) => s.machineId === machine.id && !s.retired && s.code === code)
                  const change = (values: Partial<typeof slot>) =>
                    changeSlots(
                      i,
                      slots.map((s, k) => (k === j ? { ...s, ...values } : s)),
                    )
                  return (
                    <div className="wizard-slot" key={code}>
                      <strong>
                        {code}
                        {existing ? ' · Tồn ' + existing.quantity : ''}
                      </strong>
                      <Select
                        aria-label={'Sản phẩm ô ' + code}
                        placeholder="Chưa gán"
                        value={slot.productId ?? undefined}
                        allowClear
                        showSearch={{ optionFilterProp: 'label' }}
                        disabled={!!existing && existing.quantity > 0}
                        onChange={(v) => change({ productId: v ?? null })}
                        options={db.products
                          .filter((p) => p.active || p.id === slot.productId)
                          .map((p) => ({ value: p.id, label: p.name }))}
                      />
                      <label>
                        Sức chứa{' '}
                        <InputNumber
                          aria-label={'Sức chứa ô ' + code}
                          value={slot.capacity}
                          min={Math.max(1, existing ? existing.quantity : 0)}
                          precision={0}
                          onChange={(v) => {
                            if (v) change({ capacity: v })
                          }}
                        />
                      </label>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
          <div className="form-submit">
            <Button onClick={() => go(0)}>Quay lại</Button>
            <Button type="primary" onClick={() => go(2)}>
              Tiếp tục
            </Button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <dl className="detail-list">
            {Object.entries({
              Máy: draft.name,
              'Mã máy': draft.code,
              'Địa điểm': draft.location,
              Model: draft.model,
              Serial: draft.serial,
              'Người phụ trách': draft.manager,
              'Số tầng': shelves.length,
              'Số ô': shelves.reduce((n, s) => n + s.slots.length, 0),
              'Thanh toán': draft.methods.map((m) => methods[m]).join(', ') || 'Chưa bật',
            }).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {tested && (
            <div className="flow-note">
              <Alert
                showIcon
                type={machine && machine.status !== 'ONLINE' ? 'warning' : 'success'}
                title={
                  machine && machine.status !== 'ONLINE'
                    ? 'Kiểm tra mô phỏng hoàn tất. Máy đang ' +
                      (machine.status === 'OFFLINE' ? 'ngoại tuyến.' : 'bảo trì.')
                    : 'Kiểm tra kết nối mô phỏng thành công.'
                }
              />
            </div>
          )}
          <div className="form-submit">
            <Button onClick={() => go(2)}>Quay lại</Button>
            <Button onClick={() => setTested(true)}>Kiểm tra kết nối</Button>
            <Button type="primary" onClick={save} disabled={!tested}>
              {machine ? 'Lưu cấu hình' : 'Tạo máy'}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
