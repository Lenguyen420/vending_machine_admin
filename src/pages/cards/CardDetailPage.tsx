import { useState } from 'react'
import { Button } from 'antd'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusTag } from '../../components/common/StatusTag'
import { useAction } from '../../components/common/ConfirmDialog'
import { WalletSummary } from '../../components/cards/WalletSummary'
import { WalletHistory } from '../../components/cards/WalletHistory'
import { CardPolicyForm } from '../../components/cards/CardPolicyForm'
import { CardForm } from '../../components/cards/CardForm'
import { TopUpModal } from '../../components/cards/TopUpModal'
import { useAppStore } from '../../stores/useAppStore'
import { cardStatus } from '../../static/status'
import { money } from '../../utils/currency'
import NotFoundPage from '../NotFoundPage'
export default function CardDetailPage() {
  const { id } = useParams()
  const db = useAppStore((s) => s.db)
  const navigate = useNavigate()
  const { confirm, report } = useAction()
  const [modal, setModal] = useState<'top-up' | 'replace'>()
  const card = db.cards.find((c) => c.id === id)
  const wallet = db.wallets.find((w) => w.id === card?.walletId)
  const owner = db.customers.find((c) => c.id === wallet?.customerId)
  if (!card || !wallet || !owner) return <NotFoundPage />
  const entries = db.ledger.filter((e) => e.walletId === wallet.id)
  const lock = () => useAppStore.getState().lockCard(card.id, card.status === 'ACTIVE')
  return (
    <div className="page-stack">
      <PageHeader
        title={card.code}
        description={'Chủ thẻ · ' + owner.name}
        actions={
          <>
            {card.status === 'ACTIVE' && owner.active && (
              <Button type="primary" onClick={() => setModal('top-up')}>
                Nạp tiền
              </Button>
            )}
            {card.status !== 'REPLACED' && (
              <>
                {owner.active && <Button onClick={() => setModal('replace')}>Cấp lại</Button>}
                <Button
                  danger={card.status === 'ACTIVE'}
                  onClick={() =>
                    card.status === 'ACTIVE'
                      ? confirm('Khóa thẻ', 'Thẻ sẽ không thể mua hàng hoặc nạp tiền.', lock, 'Đã khóa thẻ')
                      : report(lock(), 'Đã mở khóa thẻ')
                  }
                >
                  {card.status === 'ACTIVE' ? 'Khóa thẻ' : 'Mở khóa'}
                </Button>
              </>
            )}
          </>
        }
      />
      <div className="even-col">
        <section className="panel panel-pad">
          <div className="panel-title">
            <h2>Ví của khách hàng</h2>
            <StatusTag value={card.status} labels={cardStatus} />
          </div>
          <WalletSummary balance={wallet.balance} entries={entries} />
          <p className="flow-note">
            <Link to={'/customers/' + owner.id}>Xem khách hàng</Link>
          </p>
        </section>
        <section className="panel panel-pad">
          <div className="panel-title">
            <h2>Chính sách thẻ</h2>
          </div>
          {card.status === 'REPLACED' ? (
            <p>Hạn mức ngày {card.dailyLimit === null ? 'không giới hạn' : money(card.dailyLimit)}</p>
          ) : (
            <CardPolicyForm key={card.id} card={card} />
          )}
        </section>
      </div>
      <section className="panel panel-pad">
        <div className="panel-title">
          <h2>Lịch sử ví liên kết</h2>
        </div>
        <WalletHistory rows={entries} />
      </section>
      {modal === 'top-up' && <TopUpModal cardId={card.id} onClose={() => setModal(undefined)} />}
      {modal === 'replace' && (
        <CardForm
          replacing={card}
          onClose={() => setModal(undefined)}
          onSaved={(c) => navigate('/cards/' + c.id)}
        />
      )}
    </div>
  )
}
