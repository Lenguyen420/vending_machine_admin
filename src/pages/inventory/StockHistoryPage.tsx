import { LinkButton } from '../../components/common/LinkButton'
import { Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { StockMovementTable } from '../../components/inventory/StockMovementTable'
import { DateRange } from '../../components/reports/ReportFilters'
import { useAppStore } from '../../stores/useAppStore'
import { matches, useFilters } from '../../hooks/useFilters'
import { movementTypes, options } from '../../static/status'
import { inPeriod } from '../../services/reportService'
import { downloadCsv } from '../../utils/csv'
import { dateTime } from '../../utils/date'
import { shortId } from '../../utils/id'
export default function StockHistoryPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const [from, to] = (f.get('dates') ?? '|').split('|')
  const product = (pid: string) => db.products.find((p) => p.id === pid)
  const rows = db.movements.filter(
    (m) =>
      inPeriod(m.createdAt, { from, to }) &&
      (!f.get('type') || m.type === f.get('type')) &&
      (!f.get('machine') || m.machineId === f.get('machine')) &&
      matches(
        f.get('q'),
        shortId(m.referenceId ?? m.id),
        product(m.productId)?.name,
        product(m.productId)?.sku,
        m.note,
      ),
  )
  const exportRows = () =>
    downloadCsv('lich-su-kho', [
      [
        'Mã phiếu',
        'Loại',
        'Máy',
        'Ô',
        'SKU',
        'Số lượng',
        'Kho trước',
        'Kho sau',
        'Ô trước',
        'Ô sau',
        'Người thao tác',
        'Ghi chú',
        'Thời gian',
      ],
      ...rows.map((m) => [
        m.referenceId ?? m.id,
        movementTypes[m.type],
        db.machines.find((item) => item.id === m.machineId)?.code,
        db.slots.find((s) => s.id === m.slotId)?.code,
        product(m.productId)?.sku,
        m.quantity,
        m.warehouseBefore,
        m.warehouseAfter,
        m.slotBefore,
        m.slotAfter,
        m.actor,
        m.note,
        dateTime(m.createdAt),
      ]),
    ])
  return (
    <>
      <PageHeader
        title="Lịch sử kho"
        description="Theo dõi từng biến động tại kho tổng và tại máy."
        actions={<LinkButton to="/inventory">Về kho hàng</LinkButton>}
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm mã phiếu, SKU, ghi chú…"
        >
          <FilterSelect
            label="Loại biến động"
            value={f.get('type')}
            onChange={(v) => f.set('type', v)}
            options={options(movementTypes)}
          />
          <FilterSelect
            label="Máy bán hàng"
            value={f.get('machine')}
            onChange={(v) => f.set('machine', v)}
            options={db.machines.map((m) => ({ value: m.id, label: m.code }))}
          />
          <DateRange
            value={{ from, to }}
            onChange={(v) => f.set('dates', v.from || v.to ? (v.from ?? '') + '|' + (v.to ?? '') : undefined)}
          />
          <Button icon={<DownloadOutlined />} onClick={exportRows}>
            Xuất CSV
          </Button>
        </SearchFilters>
        <StockMovementTable rows={rows} />
      </section>
    </>
  )
}
