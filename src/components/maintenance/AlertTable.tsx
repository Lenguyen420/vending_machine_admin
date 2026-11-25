import { Button } from 'antd'
import { Link } from 'react-router-dom'
import type { Alert } from '../../types/common'
import { useAppStore } from '../../stores/useAppStore'
import { useAction } from '../common/ConfirmDialog'
import { DataTable } from '../common/DataTable'
import { StatusTag } from '../common/StatusTag'
import { alertStatus, alertTypes } from '../../static/status'
import { dateTime } from '../../utils/date'
export function AlertTable({ rows }: { rows: Alert[] }) {
  const db = useAppStore((s) => s.db)
  const { confirm, report } = useAction()
  return (
    <DataTable
      rows={rows}
      columns={[
        {
          title: 'Cảnh báo',
          render: (_, a) => (
            <div>
              <strong>{a.message}</strong>
              <small className="cell-caption">{alertTypes[a.type]}</small>
            </div>
          ),
        },
        {
          title: 'Máy / ô',
          render: (_, a) => (
            <Link to={'/machines/' + a.machineId + (a.slotId ? '?tab=shelves&slot=' + a.slotId : '')}>
              {db.machines.find((m) => m.id === a.machineId)?.code}
              {a.slotId ? ' · ' + db.slots.find((s) => s.id === a.slotId)?.code : ''}
            </Link>
          ),
        },
        {
          title: 'Mức độ',
          render: (_, a) => (
            <StatusTag
              value={a.severity === 'ERROR' ? 'FAILED' : 'OPEN'}
              labels={{ FAILED: 'Lỗi', OPEN: 'Cảnh báo' }}
            />
          ),
        },
        { title: 'Trạng thái', render: (_, a) => <StatusTag value={a.status} labels={alertStatus} /> },
        { title: 'Thời gian', render: (_, a) => dateTime(a.createdAt) },
        {
          title: 'Thao tác',
          render: (_, a) => (
            <div className="inline-actions">
              {a.status === 'OPEN' && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => report(useAppStore.getState().acknowledgeAlert(a.id), 'Đã đánh dấu đã đọc')}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
              {a.status !== 'RESOLVED' &&
                (['DISPENSE', 'DEVICE'].includes(a.type) ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() =>
                      confirm(
                        'Xác nhận đã xử lý',
                        'Cảnh báo sẽ được đóng trong lịch sử.',
                        () => useAppStore.getState().resolveAlert(a.id),
                        'Đã đóng cảnh báo',
                      )
                    }
                  >
                    Xác nhận xử lý
                  </Button>
                ) : a.type === 'OFFLINE' ? (
                  <Link to={'/machines/' + a.machineId + '?tab=settings'}>Kiểm tra kết nối</Link>
                ) : (
                  <Link to={'/inventory/restock?machine=' + a.machineId + '&slot=' + a.slotId}>
                    Tiếp hàng
                  </Link>
                ))}
            </div>
          ),
        },
      ]}
    />
  )
}
