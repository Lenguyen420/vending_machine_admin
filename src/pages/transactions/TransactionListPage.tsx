import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { OrderTable } from '../../components/transactions/OrderTable'
import { OrderDetailDrawer } from '../../components/transactions/OrderDetailDrawer'
import { DateRange } from '../../components/reports/ReportFilters'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import { methods, options, orderStatus } from '../../static/status'
import { filterOrders } from '../../services/reportService'
import { shortId } from '../../utils/id'
export default function TransactionListPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const [, setParams] = useSearchParams()
  const period = { from: f.get('from'), to: f.get('to') }
  const rows = filterOrders(db.orders, {
    ...period,
    machineId: f.get('machine'),
    location: f.get('location'),
    method: f.get('method'),
    status: f.get('status'),
  }).filter((o) =>
    matches(
      f.get('q'),
      shortId(o.id),
      o.sku,
      o.productName,
      o.machineName,
      o.slotCode,
      db.cards.find((c) => c.id === o.cardId)?.code,
    ),
  )
  const preview = db.orders.find((o) => o.id === f.get('preview'))
  const locations = [
    ...new Set([...db.machines.map((m) => m.location), ...db.orders.map((o) => o.location)]),
  ].map((value) => ({ value, label: value }))
  return (
    <>
      <PageHeader
        title="Giao dịch"
        description="Tra cứu đơn mua, kết quả thanh toán, xuất hàng và hoàn tiền."
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm mã đơn, SKU, mã thẻ…"
        >
          <DateRange
            value={period}
            onChange={(values) =>
              setParams(
                (current) => {
                  const next = new URLSearchParams(current)
                  for (const key of ['from', 'to'] as const) {
                    const value = values[key]
                    if (value) next.set(key, value)
                    else next.delete(key)
                  }
                  return next
                },
                { replace: true },
              )
            }
          />
          <FilterSelect
            label="Máy bán hàng"
            value={f.get('machine')}
            onChange={(v) => f.set('machine', v)}
            options={db.machines.map((m) => ({ value: m.id, label: m.code + ' · ' + m.name }))}
          />
          <FilterSelect
            label="Địa điểm"
            value={f.get('location')}
            onChange={(v) => f.set('location', v)}
            options={locations}
          />
          <FilterSelect
            label="Phương thức"
            value={f.get('method')}
            onChange={(v) => f.set('method', v)}
            options={options(methods)}
          />
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options(orderStatus)}
          />
        </SearchFilters>
        <OrderTable rows={rows} onPreview={(o) => f.set('preview', o.id)} />
      </section>
      {preview && <OrderDetailDrawer order={preview} onClose={() => f.set('preview')} />}
    </>
  )
}
