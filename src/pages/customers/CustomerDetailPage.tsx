import { useState } from 'react'
import { Button, Tabs } from 'antd'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusTag } from '../../components/common/StatusTag'
import { activeLabels } from '../../static/status'
import { CustomerForm } from '../../components/customers/CustomerForm'
import { CardForm } from '../../components/cards/CardForm'
import { CardTable } from '../../components/cards/CardTable'
import { WalletSummary } from '../../components/cards/WalletSummary'
import { WalletHistory } from '../../components/cards/WalletHistory'
import { OrderTable } from '../../components/transactions/OrderTable'
import { useAppStore } from '../../stores/useAppStore'
import NotFoundPage from '../NotFoundPage'
export default function CustomerDetailPage() {
  const { id } = useParams()
  const db = useAppStore((s) => s.db)
  const [modal, setModal] = useState<'edit' | 'card'>()
  const customer = db.customers.find((c) => c.id === id)
  const wallet = db.wallets.find((w) => w.customerId === id)
  if (!customer || !wallet) return <NotFoundPage />
  const entries = db.ledger.filter((e) => e.walletId === wallet.id)
  return (
    <div className="page-stack">
      <PageHeader
        title={customer.name}
        description={customer.code + ' · ' + customer.group}
        actions={
          <>
            <Button onClick={() => setModal('edit')}>Sửa khách hàng</Button>
            {customer.active && (
              <Button type="primary" onClick={() => setModal('card')}>
                Phát hành thẻ
              </Button>
            )}
          </>
        }
      />
      <section className="panel panel-pad">
        <div className="panel-title">
          <h2>Ví khách hàng</h2>
          <StatusTag value={customer.active ? 'ACTIVE' : 'INACTIVE'} labels={activeLabels} />
        </div>
        <WalletSummary balance={wallet.balance} entries={entries} />
      </section>
      <section className="panel panel-pad">
        <Tabs
          items={[
            {
              key: 'cards',
              label: 'Thẻ nội bộ',
              children: <CardTable rows={db.cards.filter((c) => c.walletId === wallet.id)} />,
            },
            { key: 'ledger', label: 'Lịch sử ví', children: <WalletHistory rows={entries} /> },
            {
              key: 'orders',
              label: 'Đơn mua hàng',
              children: <OrderTable rows={db.orders.filter((o) => o.customerId === customer.id)} />,
            },
          ]}
        />
      </section>
      {modal === 'edit' && <CustomerForm customer={customer} onClose={() => setModal(undefined)} />}
      {modal === 'card' && <CardForm customerId={customer.id} onClose={() => setModal(undefined)} />}
    </div>
  )
}
