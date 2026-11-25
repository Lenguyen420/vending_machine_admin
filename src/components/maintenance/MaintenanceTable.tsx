import { Button } from 'antd'
import { Link } from 'react-router-dom'
import type { MaintenanceTicket } from '../../types/common'
import { useAppStore } from '../../stores/useAppStore'
import { priorityLabels, ticketStatus } from '../../static/status'
import { dateTime } from '../../utils/date'
import { shortId } from '../../utils/id'
import { DataTable } from '../common/DataTable'
import { StatusTag } from '../common/StatusTag'
export function MaintenanceTable({
  rows,
  onEdit,
}: {
  rows: MaintenanceTicket[]
  onEdit?: (ticket: MaintenanceTicket) => void
}) {
  const machines = useAppStore((s) => s.db.machines)
  return (
    <DataTable
      rows={rows}
      columns={[
        { title: 'Mã phiếu', render: (_, t) => shortId(t.id) },
        {
          title: 'Máy',
          render: (_, t) => (
            <Link to={'/machines/' + t.machineId}>{machines.find((m) => m.id === t.machineId)?.code}</Link>
          ),
        },
        { title: 'Mô tả', dataIndex: 'description' },
        { title: 'Kỹ thuật viên', dataIndex: 'assignee' },
        { title: 'Ưu tiên', render: (_, t) => <StatusTag value={t.priority} labels={priorityLabels} /> },
        { title: 'Trạng thái', render: (_, t) => <StatusTag value={t.status} labels={ticketStatus} /> },
        { title: 'Ngày tạo', render: (_, t) => dateTime(t.createdAt) },
        ...(onEdit
          ? [
              {
                title: 'Thao tác',
                render: (_: unknown, t: MaintenanceTicket) => (
                  <Button type="link" size="small" onClick={() => onEdit(t)}>
                    Cập nhật
                  </Button>
                ),
              },
            ]
          : []),
      ]}
    />
  )
}
