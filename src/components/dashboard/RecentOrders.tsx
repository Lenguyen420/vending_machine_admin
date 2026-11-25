import { Link } from 'react-router-dom'
import type { Order } from '../../types/transaction'
import { StatusTag } from '../common/StatusTag'
import { orderStatus } from '../../static/status'
import { dateTime } from '../../utils/date'
import { MoneyText } from '../common/MoneyText'
import { DataTable } from '../common/DataTable'
export function RecentOrders({ orders, href }: { orders: Order[]; href: string }) {
  return (
    <section className="panel panel-pad">
      <div className="panel-title">
        <h2>Giao dịch gần đây</h2>
        <Link to={href}>Xem tất cả</Link>
      </div>
      <DataTable
        compact
        rows={orders.slice(0, 5)}
        columns={[
          { title: 'Sản phẩm', render: (_, o) => <Link to={'/transactions/' + o.id}>{o.productName}</Link> },
          { title: 'Máy bán hàng', dataIndex: 'machineName' },
          { title: 'Số tiền', render: (_, o) => <MoneyText value={o.total} /> },
          { title: 'Trạng thái', render: (_, o) => <StatusTag value={o.status} labels={orderStatus} /> },
          { title: 'Thời gian', render: (_, o) => dateTime(o.createdAt) },
        ]}
      />
    </section>
  )
}
