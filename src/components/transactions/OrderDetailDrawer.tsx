import { Divider, Drawer, Timeline } from 'antd'
import { Link } from 'react-router-dom'
import type { Order } from '../../types/transaction'
import { useAppStore } from '../../stores/useAppStore'
import { dispenseStatus, methods, orderStatus, paymentStatus } from '../../static/status'
import { dateTime } from '../../utils/date'
import { shortId } from '../../utils/id'
import { money } from '../../utils/currency'
import { LinkButton } from '../common/LinkButton'
import { StatusTag } from '../common/StatusTag'
export function OrderDetails({ order: o }: { order: Order }) {
  const db = useAppStore((s) => s.db)
  const payment = db.payments.find((p) => p.orderId === o.id)
  const dispense = db.dispenseLogs.find((p) => p.orderId === o.id)
  const refund = db.refunds.find((r) => r.orderId === o.id)
  const card = db.cards.find((c) => c.id === o.cardId)
  const customer = db.customers.find((c) => c.id === o.customerId)
  const data = {
    'Mã đơn': shortId(o.id),
    'Máy bán hàng': <Link to={'/machines/' + o.machineId}>{o.machineName}</Link>,
    'Địa điểm lúc bán': o.location,
    'Sản phẩm lúc bán': o.productName,
    SKU: o.sku,
    'Ô hàng': o.slotCode,
    'Số lượng': o.quantity,
    'Đơn giá lúc bán': money(o.unitPrice),
    'Giá vốn lúc bán': money(o.unitCost),
    'Tổng tiền': money(o.total),
    'Phương thức': methods[o.method],
    'Khách hàng': customer ? <Link to={'/customers/' + customer.id}>{customer.name}</Link> : '—',
    Thẻ: card ? <Link to={'/cards/' + card.id}>{card.code}</Link> : '—',
    'Thanh toán': <StatusTag value={o.paymentStatus} labels={paymentStatus} />,
    'Xuất hàng': <StatusTag value={o.dispenseStatus} labels={dispenseStatus} />,
    'Trạng thái': <StatusTag value={o.status} labels={orderStatus} />,
  }
  const steps = [{ color: 'blue', content: <>Tạo đơn · {dateTime(o.createdAt)}</> }]
  if (payment)
    steps.push({
      color: payment.status === 'SUCCESS' ? 'green' : 'red',
      content: (
        <>
          {payment.status === 'SUCCESS' ? 'Thanh toán thành công' : 'Thanh toán thất bại'} ·{' '}
          {dateTime(payment.createdAt)}
        </>
      ),
    })
  if (dispense)
    steps.push({
      color: dispense.status === 'SUCCESS' ? 'green' : 'red',
      content: (
        <>
          {dispenseStatus[dispense.status]} · {dateTime(dispense.createdAt)}
        </>
      ),
    })
  if (refund)
    steps.push({
      color: 'blue',
      content: (
        <>
          Hoàn {money(refund.amount)} · {dateTime(refund.createdAt)}
          <small className="cell-caption">
            {refund.reason} · {refund.actor}
          </small>
        </>
      ),
    })
  return (
    <>
      <dl className="detail-list">
        {Object.entries(data).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <Divider />
      <div className="panel-title">
        <h2>Tiến trình giao dịch</h2>
      </div>
      <Timeline items={steps} />
    </>
  )
}
export function OrderDetailDrawer({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <Drawer
      open
      onClose={onClose}
      title={'Đơn ' + shortId(order.id)}
      size={560}
      extra={<LinkButton to={'/transactions/' + order.id}>Mở chi tiết</LinkButton>}
    >
      <OrderDetails order={order} />
    </Drawer>
  )
}
