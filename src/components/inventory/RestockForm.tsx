import { LinkButton } from '../common/LinkButton'
import { useState } from 'react'
import { Alert, Button, Input, InputNumber, Select } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import { useAction } from '../common/ConfirmDialog'
import { options } from '../../static/status'
import { warehouseQuantity } from '../../services/inventoryService'
import { StockAdjustForm } from './StockAdjustForm'
import { stockTypes } from '../../static/status'
import type { StockType } from '../../static/status'
import type { StockLine } from '../../types/inventory'
import { id } from '../../utils/id'
interface Line extends StockLine {
  key: string
  machineId?: string
}
const newLine = (): Line => ({ key: id(), quantity: 0 })
export function RestockForm({
  initialType = 'RESTOCK',
  initialMachine,
  initialSlot,
  initialProduct,
}: {
  initialType?: StockType
  initialMachine?: string
  initialSlot?: string
  initialProduct?: string
}) {
  const db = useAppStore((s) => s.db)
  const { report, confirm } = useAction()
  const navigate = useNavigate()
  const [type, setType] = useState(initialType)
  const [scope, setScope] = useState<'warehouse' | 'machine'>(initialSlot ? 'machine' : 'warehouse')
  const [lines, setLines] = useState<Line[]>(() => [
    { ...newLine(), machineId: initialMachine, slotId: initialSlot, productId: initialProduct },
  ])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const bySlot = type === 'RESTOCK' || type === 'RETURN' || (type !== 'IMPORT' && scope === 'machine')
  const update = (key: string, values: Partial<Line>) =>
    setLines((previous) => previous.map((l) => (l.key === key ? { ...l, ...values } : l)))
  const save = () => {
    const { restock, returnStock, importStock, adjustStock } = useAppStore.getState()
    const data = lines.map((l) => ({
      quantity: l.quantity,
      productId: bySlot ? undefined : l.productId,
      slotId: bySlot ? l.slotId : undefined,
    }))
    const operation = () => {
      const result =
        type === 'RESTOCK'
          ? restock(data, note)
          : type === 'RETURN'
            ? returnStock(data, note)
            : type === 'IMPORT'
              ? importStock(data, note)
              : adjustStock(data, note, type === 'WASTE')
      if (result.ok) navigate('/inventory/history')
      return result
    }
    if (type === 'WASTE' || type === 'ADJUST')
      confirm(
        'Xác nhận biến động kho',
        'Thao tác sẽ cập nhật tồn và ghi vào lịch sử.',
        operation,
        'Đã ghi phiếu tồn kho',
        setError,
      )
    else {
      const result = operation()
      report(result, 'Đã ghi phiếu tồn kho')
      if (!result.ok) setError(result.message)
    }
  }
  return (
    <section className="panel panel-pad form-flow">
      <div className="inline-actions">
        <label>
          Loại phiếu{' '}
          <Select
            aria-label="Loại phiếu"
            value={type}
            onChange={(v) => {
              setType(v)
              setLines([newLine()])
              setError('')
            }}
            options={options(stockTypes)}
          />
        </label>
        {(type === 'WASTE' || type === 'ADJUST') && (
          <StockAdjustForm
            scope={scope}
            onScope={(value) => {
              setScope(value)
              setLines([newLine()])
            }}
          />
        )}
      </div>
      {error && <Alert showIcon type="error" title={error} />}
      {lines.map((line) => {
        const slots = db.slots
          .filter((s) => s.machineId === line.machineId && !s.retired && s.productId)
          .sort((a, b) => a.code.localeCompare(b.code))
        const slot = slots.find((s) => s.id === line.slotId)
        const sku = db.products.find((p) => p.id === (bySlot ? slot?.productId : line.productId))
        return (
          <div className="shelf-edit" key={line.key}>
            <div className="panel-title">
              <h2>{sku ? sku.sku + ' · ' + sku.name : 'Dòng hàng'}</h2>
              {lines.length > 1 && (
                <Button
                  danger
                  aria-label="Bỏ dòng hàng"
                  icon={<DeleteOutlined />}
                  onClick={() => setLines((previous) => previous.filter((l) => l.key !== line.key))}
                />
              )}
            </div>
            <div className="even-col">
              {bySlot ? (
                <>
                  <label>
                    Máy bán hàng
                    <Select
                      className="full-width"
                      aria-label="Máy bán hàng"
                      showSearch={{ optionFilterProp: 'label' }}
                      value={line.machineId}
                      onChange={(machineId) => update(line.key, { machineId, slotId: undefined })}
                      options={db.machines
                        .filter((m) => type !== 'RESTOCK' || m.active)
                        .map((m) => ({ value: m.id, label: m.code + ' · ' + m.name }))}
                    />
                  </label>
                  <label>
                    Ô hàng
                    <Select
                      className="full-width"
                      aria-label="Ô hàng"
                      showSearch={{ optionFilterProp: 'label' }}
                      value={line.slotId}
                      disabled={!line.machineId}
                      onChange={(slotId) => update(line.key, { slotId })}
                      options={slots.map((s) => ({
                        value: s.id,
                        label: s.code + ' · ' + db.products.find((p) => p.id === s.productId)?.name,
                      }))}
                    />
                  </label>
                </>
              ) : (
                <label>
                  Sản phẩm
                  <Select
                    className="full-width"
                    aria-label="Sản phẩm"
                    showSearch={{ optionFilterProp: 'label' }}
                    value={line.productId}
                    onChange={(productId) => update(line.key, { productId })}
                    options={db.products.map((p) => ({ value: p.id, label: p.sku + ' · ' + p.name }))}
                  />
                </label>
              )}
              <label>
                {type === 'ADJUST' ? 'Mức thay đổi (+/−)' : 'Số lượng'}
                <InputNumber
                  className="full-width"
                  aria-label="Số lượng"
                  precision={0}
                  min={type === 'ADJUST' ? undefined : 1}
                  value={line.quantity || null}
                  onChange={(quantity) => update(line.key, { quantity: quantity ?? 0 })}
                />
              </label>
            </div>
            {sku && (
              <p className="flow-note">
                Kho tổng <strong>{warehouseQuantity(db, sku.id)}</strong>
                {slot && (
                  <>
                    {' '}
                    · Tồn ô{' '}
                    <strong>
                      {slot.quantity}/{slot.capacity}
                    </strong>{' '}
                    · Còn trống <strong>{slot.capacity - slot.quantity}</strong>
                  </>
                )}
              </p>
            )}
          </div>
        )
      })}
      <div>
        <Button icon={<PlusOutlined />} onClick={() => setLines((previous) => [...previous, newLine()])}>
          Thêm dòng hàng
        </Button>
      </div>
      <label>
        {type === 'WASTE' || type === 'ADJUST' ? 'Lý do (bắt buộc)' : 'Ghi chú, hạn dùng gần nhất (nếu có)'}
        <Input.TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="form-submit">
        <LinkButton to="/inventory">Hủy</LinkButton>
        <Button type="primary" onClick={save}>
          Lưu phiếu
        </Button>
      </div>
    </section>
  )
}
