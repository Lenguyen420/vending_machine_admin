import { Button } from 'antd'
import { Link } from 'react-router-dom'
import type { Order } from '../../types/transaction'
import { useAppStore } from '../../stores/useAppStore'
import { nameOf } from '../../stores/selectors'
import { dateTime } from '../../utils/date'
import { shortId } from '../../utils/id'
import { dispenseStatus, methods, orderStatus, paymentStatus } from '../../static/status'
import { DataTable } from '../common/DataTable'
import { StatusTag } from '../common/StatusTag'
import { MoneyText } from '../common/MoneyText'
export function OrderTable({ rows, onPreview }: { rows: Order[]; onPreview?: (order: Order) => void }) {
  const db = useAppStore((s) => s.db)
  return (
    <DataTable
      rows={rows}
      columns={[
        {
          title: 'Mã đơn',
          render: (_, o) => (
            <Link to={'/transactions/' + o.id}>
              <strong>{shortId(o.id)}</strong>
            </Link>
          ),
        },
        {
          title: 'Máy / địa điểm',
          render: (_, o) => (
            <div>
              <Link to={'/machines/' + o.machineId}>{o.machineName}</Link>
              <small className="cell-caption">{o.location}</small>
            </div>
          ),
        },
        {
          title: 'Sản phẩm / ô',
          render: (_, o) => (
            <div>
              {o.productName}
              <small className="cell-caption">
                {o.sku} · {o.slotCode}
              </small>
            </div>
          ),
        },
        {
          title: 'Khách / thẻ',
          render: (_, o) =>
            o.customerId ? (
              <div>
                {nameOf(db.customers, o.customerId)}
                <small className="cell-caption">
                  <Link to={'/cards/' + o.cardId}>{db.cards.find((c) => c.id === o.cardId)?.code}</Link>
                </small>
              </div>
            ) : (
              '—'
            ),
        },
        { title: 'Phương thức', render: (_, o) => methods[o.method] },
        { title: 'Số tiền', render: (_, o) => <MoneyText value={o.total} /> },
        {
          title: 'Thanh toán',
          render: (_, o) => <StatusTag value={o.paymentStatus} labels={paymentStatus} />,
        },
        {
          title: 'Xuất hàng',
          render: (_, o) => <StatusTag value={o.dispenseStatus} labels={dispenseStatus} />,
        },
        { title: 'Trạng thái đơn', render: (_, o) => <StatusTag value={o.status} labels={orderStatus} /> },
        { title: 'Thời gian', render: (_, o) => dateTime(o.createdAt) },
        ...(onPreview
          ? [
              {
                title: 'Thao tác',
                render: (_: unknown, o: Order) => (
                  <Button type="link" size="small" onClick={() => onPreview(o)}>
                    Xem nhanh
                  </Button>
                ),
              },
            ]
          : []),
      ]}
    />
  )
}
