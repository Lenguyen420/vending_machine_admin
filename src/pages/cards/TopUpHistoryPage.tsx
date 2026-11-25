import { LinkButton } from '../../components/common/LinkButton'
import { useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { WalletHistory } from '../../components/cards/WalletHistory'
import { DateRange } from '../../components/reports/ReportFilters'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import { topUpMethods } from '../../static/constants'
import { inPeriod } from '../../services/reportService'
import type { Period } from '../../services/reportService'
import { shortId } from '../../utils/id'
export default function TopUpHistoryPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const [period, setPeriod] = useState<Period>({})
  const rows = db.ledger.filter(
    (e) =>
      e.type === 'TOP_UP' &&
      inPeriod(e.createdAt, period) &&
      (!f.get('method') || f.get('method') === e.method) &&
      matches(f.get('q'), shortId(e.referenceId), db.cards.find((c) => c.id === e.cardId)?.code, e.note),
  )
  return (
    <>
      <PageHeader
        title="Lịch sử nạp tiền"
        description="Theo dõi các khoản nạp và số dư trước, sau giao dịch."
        actions={<LinkButton to="/cards">Về thẻ & ví</LinkButton>}
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm mã giao dịch, mã thẻ…"
        >
          <DateRange value={period} onChange={setPeriod} />
          <FilterSelect
            label="Phương thức"
            value={f.get('method')}
            onChange={(v) => f.set('method', v)}
            options={topUpMethods.map((value) => ({ value, label: value }))}
          />
        </SearchFilters>
        <WalletHistory rows={rows} />
      </section>
    </>
  )
}
