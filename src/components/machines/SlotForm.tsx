import { LinkButton } from '../common/LinkButton'
import { Button, Divider, Form, Space } from 'antd'
import { Link } from 'react-router-dom'
import type { Slot, SlotInput } from '../../types/machine'
import { useAppStore } from '../../stores/useAppStore'
import { NumberField, SelectField, SwitchField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
import { dateTime } from '../../utils/date'
import { money } from '../../utils/currency'
import { EmptyState } from '../common/EmptyState'
import { shortId } from '../../utils/id'
export function SlotForm({ slot }: { slot: Slot }) {
  const db = useAppStore((s) => s.db)
  const update = useAppStore((s) => s.updateSlot)
  const { report } = useAction()
  const lastRestock = db.movements.find((m) => m.slotId === slot.id && m.type === 'RESTOCK')
  const orders = db.orders.filter((o) => o.slotId === slot.id).slice(0, 5)
  return (
    <>
      <dl className="detail-list">
        <div>
          <dt>Tồn hiện tại</dt>
          <dd>
            {slot.quantity}/{slot.capacity}
          </dd>
        </div>
        <div>
          <dt>Tiếp hàng gần nhất</dt>
          <dd>{dateTime(lastRestock?.createdAt)}</dd>
        </div>
      </dl>
      <Divider />
      <Form
        layout="vertical"
        initialValues={slot}
        onFinish={(values: SlotInput) =>
          report(
            update(slot.id, {
              ...values,
              productId: values.productId ?? null,
              priceOverride: values.priceOverride ?? null,
            }),
          )
        }
      >
        <SelectField
          name="productId"
          label="Sản phẩm"
          optional
          disabled={slot.quantity > 0}
          options={db.products
            .filter((p) => p.active || p.id === slot.productId)
            .map((p) => ({ value: p.id, label: p.sku + ' · ' + p.name }))}
        />
        <div className="form-grid">
          <NumberField name="capacity" label="Sức chứa" min={Math.max(1, slot.quantity)} />
          <NumberField name="lowThreshold" label="Ngưỡng cảnh báo" />
          <NumberField name="priceOverride" label="Giá bán riêng (VNĐ)" optional />
          <SelectField
            name="motorStatus"
            label="Động cơ mô phỏng"
            options={[
              { value: 'OK', label: 'Sẵn sàng' },
              { value: 'ERROR', label: 'Báo lỗi' },
            ]}
          />
          <SwitchField name="active" label="Cho phép bán" />
        </div>
        <div className="form-submit">
          <Button type="primary" htmlType="submit">
            Lưu cấu hình ô
          </Button>
        </div>
      </Form>
      {slot.productId && (
        <Space wrap>
          <LinkButton to={'/inventory/restock?machine=' + slot.machineId + '&slot=' + slot.id}>
            Tiếp hàng
          </LinkButton>
          <LinkButton to={'/inventory/restock?type=RETURN&machine=' + slot.machineId + '&slot=' + slot.id}>
            Thu hồi
          </LinkButton>
        </Space>
      )}
      <Divider />
      <h2>Giao dịch gần đây</h2>
      {orders.length ? (
        <ul className="clean-list">
          {orders.map((o) => (
            <li key={o.id}>
              <Link to={'/transactions/' + o.id}>{shortId(o.id)}</Link>
              <span>
                {money(o.total)} · {dateTime(o.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState description="Ô này chưa có giao dịch" />
      )}
    </>
  )
}
