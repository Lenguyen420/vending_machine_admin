import { LinkButton } from '../../components/common/LinkButton'
import { useState } from 'react'
import { Button } from 'antd'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { RefundModal } from '../../components/transactions/RefundModal'
import { OrderDetails } from '../../components/transactions/OrderDetailDrawer'
import { useAppStore } from '../../stores/useAppStore'
import { shortId } from '../../utils/id'
import { dateTime } from '../../utils/date'
import NotFoundPage from '../NotFoundPage'
export default function TransactionDetailPage() {
  const { id } = useParams()
  const order = useAppStore((s) => s.db.orders.find((o) => o.id === id))
  const [refunding, setRefunding] = useState(false)
  if (!order) return <NotFoundPage />
  return (
    <>
      <PageHeader
        title={'Đơn ' + shortId(order.id)}
        description={order.machineName + ' · ' + dateTime(order.createdAt)}
        actions={
          <>
            <LinkButton to="/transactions">Về giao dịch</LinkButton>
            {order.status === 'SUCCESS' && (
              <Button danger onClick={() => setRefunding(true)}>
                Hoàn tiền
              </Button>
            )}
          </>
        }
      />
      <section className="panel panel-pad">
        <OrderDetails order={order} />
      </section>
      {refunding && <RefundModal order={order} onClose={() => setRefunding(false)} />}
    </>
  )
}
