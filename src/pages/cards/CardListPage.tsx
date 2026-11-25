import { LinkButton } from '../../components/common/LinkButton'
import { useState } from 'react'
import { Button } from 'antd'
import { CreditCardOutlined, PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { CardTable } from '../../components/cards/CardTable'
import { CardForm } from '../../components/cards/CardForm'
import { TopUpModal } from '../../components/cards/TopUpModal'
import { useFilters, matches } from '../../hooks/useFilters'
import { useAppStore } from '../../stores/useAppStore'
import { cardWallet, nameOf } from '../../stores/selectors'
import { cardStatus, options } from '../../static/status'
export default function CardListPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const [issue, setIssue] = useState(false)
  const [topUp, setTopUp] = useState<string | null>()
  const rows = db.cards.filter(
    (c) =>
      matches(f.get('q'), c.code, nameOf(db.customers, cardWallet(db, c.id)?.customerId)) &&
      (!f.get('status') || f.get('status') === c.status),
  )
  return (
    <>
      <PageHeader
        title="Thẻ & ví"
        description="Quản lý thẻ nội bộ và số dư ví của khách hàng."
        actions={
          <>
            <LinkButton to="/cards/top-ups">Lịch sử nạp</LinkButton>
            <Button icon={<PlusOutlined />} onClick={() => setTopUp(null)}>
              Nạp tiền
            </Button>
            <Button type="primary" icon={<CreditCardOutlined />} onClick={() => setIssue(true)}>
              Phát hành thẻ
            </Button>
          </>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters search={f.get('q')} onSearch={(v) => f.set('q', v)} placeholder="Tìm mã thẻ, chủ thẻ…">
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options(cardStatus)}
          />
        </SearchFilters>
        <CardTable rows={rows} onTopUp={setTopUp} />
      </section>
      {issue && <CardForm onClose={() => setIssue(false)} />}
      {topUp !== undefined && <TopUpModal cardId={topUp ?? undefined} onClose={() => setTopUp(undefined)} />}
    </>
  )
}
