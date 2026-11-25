import { useRef, useState } from 'react'
import { Alert, Button, Form, Select } from 'antd'
import { Link } from 'react-router-dom'
import type { Machine, PaymentMethod } from '../../types/machine'
import type { Order, PurchaseInput } from '../../types/transaction'
import { useAppStore } from '../../stores/useAppStore'
import { cardWallet, machineSlots } from '../../stores/selectors'
import { useAction } from '../common/ConfirmDialog'
import { EmptyState } from '../common/EmptyState'
import { MoneyText } from '../common/MoneyText'
import { SelectField } from '../common/FormFields'
import { methods } from '../../static/status'
import { money } from '../../utils/currency'
import { id, shortId } from '../../utils/id'
import { ShelfGrid } from './ShelfGrid'
const scenarios = [
  { value: 'SUCCESS', label: 'Thành công' },
  { value: 'PAYMENT_FAILURE', label: 'Thanh toán thất bại' },
  { value: 'DISPENSE_FAILURE', label: 'Đã thanh toán, lỗi xuất hàng' },
]
export function MachineSimulator({ machine }: { machine: Machine }) {
  const db = useAppStore((s) => s.db)
  const [form] = Form.useForm()
  const selectedMethod = Form.useWatch('method', form) as PaymentMethod | undefined
  const [slotId, setSlotId] = useState<string>()
  const [result, setResult] = useState<Order>()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const inFlight = useRef(false)
  const { report } = useAction()
  const slot = machineSlots(db, machine.id).find((s) => s.id === slotId)
  const product = db.products.find((p) => p.id === slot?.productId)
  const ready = machine.active && machine.status === 'ONLINE' && machine.methods.length > 0
  const choices = machineSlots(db, machine.id).flatMap((s) => {
    const p = db.products.find((item) => item.id === s.productId)
    return s.active && s.quantity > 0 && p?.active
      ? [{ value: s.id, label: s.code + ' · ' + p.name + ' · ' + money(s.priceOverride ?? p.price) }]
      : []
  })
  const pick = (value: string) => {
    setSlotId(value)
    setError('')
    setResult(undefined)
  }
  const onBuy = async (values: {
    method: PaymentMethod
    cardId?: string
    scenario: PurchaseInput['scenario']
  }) => {
    if (inFlight.current || !slot) return
    inFlight.current = true
    setPending(true)
    setError('')
    setResult(undefined)
    const operationId = id()
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 280))
      const response = useAppStore
        .getState()
        .simulatePurchase({ operationId, machineId: machine.id, slotId: slot.id, ...values })
      if (response.ok) {
        setResult(response.data)
        if (response.data.status === 'SUCCESS') report(response, 'Mua hàng thành công')
      } else {
        setError(response.message)
        report(response)
      }
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  return (
    <div className="two-col">
      <section className="panel panel-pad">
        <ShelfGrid
          machineId={machine.id}
          selected={slotId}
          shop
          onSlot={(item) => {
            if (!pending) pick(item.id)
          }}
        />
      </section>
      <section className="panel panel-pad">
        <div className="panel-title">
          <h2>Giỏ hàng mô phỏng</h2>
        </div>
        {!ready && (
          <Alert
            type="warning"
            showIcon
            title="Máy cần trực tuyến và bật ít nhất một phương thức thanh toán."
          />
        )}
        {choices.length ? (
          <div className="flow-note">
            <label>
              Sản phẩm đang bán
              <Select
                className="full-width"
                aria-label="Sản phẩm đang bán"
                showSearch={{ optionFilterProp: 'label' }}
                disabled={pending}
                placeholder="Chọn một ô"
                options={choices}
                value={slotId}
                onChange={pick}
              />
            </label>
          </div>
        ) : (
          <EmptyState description="Máy chưa có sản phẩm đang bán" />
        )}
        {slot && product && (
          <p className="flow-note">
            <strong>{product.name}</strong> · 1 sản phẩm ·{' '}
            <MoneyText value={slot.priceOverride ?? product.price} />
          </p>
        )}
        <Form
          className="flow-note"
          form={form}
          layout="vertical"
          disabled={pending}
          initialValues={{ method: machine.methods[0], scenario: 'SUCCESS' }}
          onFinish={onBuy}
        >
          <SelectField
            name="method"
            label="Thanh toán"
            options={machine.methods.map((value) => ({ value, label: methods[value] }))}
          />
          {selectedMethod === 'INTERNAL_CARD' && (
            <SelectField
              name="cardId"
              label="Thẻ nội bộ"
              options={db.cards.map((c) => {
                const wallet = cardWallet(db, c.id)
                return {
                  value: c.id,
                  label: c.code + ' · ' + money(wallet?.balance ?? 0),
                  disabled:
                    c.status !== 'ACTIVE' ||
                    !db.customers.find((person) => person.id === wallet?.customerId)?.active,
                }
              })}
            />
          )}
          <SelectField name="scenario" label="Kịch bản" options={scenarios} />
          <Button
            type="primary"
            htmlType="submit"
            loading={pending}
            disabled={!ready || !choices.some((c) => c.value === slotId)}
            block
          >
            Xác nhận mua hàng
          </Button>
        </Form>
        {error && (
          <div className="flow-note">
            <Alert showIcon type="error" title={error} />
          </div>
        )}
        {result && (
          <div className="flow-note">
            <Alert
              showIcon
              type={
                result.status === 'SUCCESS' ? 'success' : result.status === 'REFUNDED' ? 'warning' : 'error'
              }
              title={
                result.status === 'SUCCESS'
                  ? 'Đã xuất hàng thành công'
                  : result.status === 'REFUNDED'
                    ? 'Xuất hàng lỗi. Đã hoàn tiền.'
                    : 'Thanh toán thất bại'
              }
              description={<Link to={'/transactions/' + result.id}>Xem đơn {shortId(result.id)}</Link>}
            />
          </div>
        )}
      </section>
    </div>
  )
}
