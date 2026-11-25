import { LinkButton } from '../../components/common/LinkButton'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { AlertTable } from '../../components/maintenance/AlertTable'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import { alertStatus, alertTypes, options } from '../../static/status'
export default function AlertsPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const stockGroup = f.get('group') === 'stock'
  const locations = [...new Set(db.machines.map((m) => m.location))].map((value) => ({ value, label: value }))
  const rows = db.alerts.filter((a) => {
    const machine = db.machines.find((m) => m.id === a.machineId)
    return (
      matches(f.get('q'), a.message, machine?.name, machine?.code) &&
      (!f.get('location') || machine?.location === f.get('location')) &&
      (!f.get('machine') || f.get('machine') === a.machineId) &&
      (!f.get('status') ||
        f.get('status') === a.status ||
        (f.get('status') === 'active' && a.status !== 'RESOLVED')) &&
      (!f.get('type') || f.get('type') === a.type) &&
      (!stockGroup || ['LOW_STOCK', 'OUT_OF_STOCK'].includes(a.type))
    )
  })
  return (
    <>
      <PageHeader
        title="Cảnh báo"
        description="Theo dõi lỗi thiết bị, mất kết nối và mức tồn tại máy."
        actions={<LinkButton to="/maintenance">Phiếu bảo trì</LinkButton>}
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm nội dung, mã máy…"
        >
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options({ ...alertStatus, active: 'Đang mở' })}
          />
          <FilterSelect
            label="Nhóm"
            value={f.get('group')}
            onChange={(v) => f.set('group', v)}
            options={[{ value: 'stock', label: 'Tồn kho' }]}
          />
          <FilterSelect
            label="Loại cảnh báo"
            value={f.get('type')}
            onChange={(v) => f.set('type', v)}
            options={options(alertTypes)}
          />
          <FilterSelect
            label="Máy bán hàng"
            value={f.get('machine')}
            onChange={(v) => f.set('machine', v)}
            options={db.machines.map((m) => ({ value: m.id, label: m.code }))}
          />
          <FilterSelect
            label="Địa điểm"
            value={f.get('location')}
            onChange={(v) => f.set('location', v)}
            options={locations}
          />
          <FilterSelect
            label="Mức độ"
            value={f.get('severity')}
            onChange={(v) => f.set('severity', v)}
            options={[
              { value: 'ERROR', label: 'Lỗi' },
              { value: 'WARNING', label: 'Cảnh báo' },
            ]}
          />
        </SearchFilters>
        <AlertTable rows={rows.filter((a) => !f.get('severity') || f.get('severity') === a.severity)} />
      </section>
    </>
  )
}
