import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { MaintenanceTable } from '../../components/maintenance/MaintenanceTable'
import { MaintenanceForm } from '../../components/maintenance/MaintenanceForm'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import { options, priorityLabels, ticketStatus } from '../../static/status'
import type { MaintenanceTicket } from '../../types/common'
import { shortId } from '../../utils/id'
export default function MaintenancePage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const [editing, setEditing] = useState<MaintenanceTicket | null>()
  const rows = db.maintenance.filter(
    (t) =>
      matches(f.get('q'), shortId(t.id), t.description, t.assignee) &&
      (!f.get('machine') || t.machineId === f.get('machine')) &&
      (!f.get('status') || t.status === f.get('status')) &&
      (!f.get('priority') || t.priority === f.get('priority')),
  )
  return (
    <>
      <PageHeader
        title="Bảo trì"
        description="Tạo phiếu và theo dõi tiến độ xử lý tại từng máy."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>
            Tạo phiếu
          </Button>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm phiếu, kỹ thuật viên…"
        >
          <FilterSelect
            label="Máy bán hàng"
            value={f.get('machine')}
            onChange={(v) => f.set('machine', v)}
            options={db.machines.map((m) => ({ value: m.id, label: m.code }))}
          />
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options(ticketStatus)}
          />
          <FilterSelect
            label="Ưu tiên"
            value={f.get('priority')}
            onChange={(v) => f.set('priority', v)}
            options={options(priorityLabels)}
          />
        </SearchFilters>
        <MaintenanceTable rows={rows} onEdit={setEditing} />
      </section>
      {editing !== undefined && (
        <MaintenanceForm
          ticket={editing ?? undefined}
          machineId={f.get('machine')}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  )
}
