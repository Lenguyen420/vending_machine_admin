import { LinkButton } from '../../components/common/LinkButton'
import { Segmented } from 'antd'
import { AppstoreOutlined, PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { EmptyState } from '../../components/common/EmptyState'
import { MachineCard } from '../../components/machines/MachineCard'
import { MachineTable } from '../../components/machines/MachineTable'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import { machineStatus, options } from '../../static/status'
export default function MachineListPage() {
  const machines = useAppStore((s) => s.db.machines)
  const f = useFilters()
  const locations = [...new Set(machines.map((m) => m.location))].map((value) => ({ value, label: value }))
  const rows = machines.filter(
    (m) =>
      matches(f.get('q'), m.name, m.code, m.serial, m.location, m.model) &&
      (!f.get('status') || f.get('status') === (m.active ? m.status : 'INACTIVE')) &&
      (!f.get('location') || f.get('location') === m.location),
  )
  const cards = f.get('view') === 'cards'
  return (
    <>
      <PageHeader
        title="Máy bán hàng"
        description="Theo dõi trạng thái và cấu hình từng điểm bán."
        actions={
          <LinkButton to="/machines/new" type="primary" icon={<PlusOutlined />}>
            Thêm máy
          </LinkButton>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm tên, mã máy, serial…"
        >
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options({ ...machineStatus, INACTIVE: 'Ngừng hoạt động' })}
          />
          <FilterSelect
            label="Địa điểm"
            value={f.get('location')}
            onChange={(v) => f.set('location', v)}
            options={locations}
          />
          <Segmented
            aria-label="Kiểu hiển thị"
            value={cards ? 'cards' : 'table'}
            onChange={(v) => f.set('view', v === 'table' ? undefined : v)}
            options={[
              { value: 'table', label: 'Bảng', icon: <UnorderedListOutlined /> },
              { value: 'cards', label: 'Thẻ', icon: <AppstoreOutlined /> },
            ]}
          />
        </SearchFilters>
        {cards ? (
          rows.length ? (
            <div className="machine-grid">
              {rows.map((m) => (
                <MachineCard key={m.id} machine={m} />
              ))}
            </div>
          ) : (
            <EmptyState />
          )
        ) : (
          <MachineTable rows={rows} />
        )}
      </section>
    </>
  )
}
