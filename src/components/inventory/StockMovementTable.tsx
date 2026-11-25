import { Link } from 'react-router-dom'
import type { StockMovement } from '../../types/inventory'
import { useAppStore } from '../../stores/useAppStore'
import { movementTypes } from '../../static/status'
import { dateTime } from '../../utils/date'
import { shortId } from '../../utils/id'
import { DataTable } from '../common/DataTable'
function formatChange(before?: number, after?: number) {
  return before === undefined ? '—' : before + ' → ' + after
}
export function StockMovementTable({ rows }: { rows: StockMovement[] }) {
  const db = useAppStore((s) => s.db)
  return (
    <DataTable
      rows={rows}
      columns={[
        { title: 'Mã phiếu', render: (_, m) => shortId(m.referenceId ?? m.id) },
        { title: 'Loại', render: (_, m) => movementTypes[m.type] },
        {
          title: 'Máy / ô',
          render: (_, m) =>
            m.machineId ? (
              <Link to={'/machines/' + m.machineId + '?tab=shelves&slot=' + m.slotId}>
                {db.machines.find((item) => item.id === m.machineId)?.code} /{' '}
                {db.slots.find((s) => s.id === m.slotId)?.code}
              </Link>
            ) : (
              'Kho tổng'
            ),
        },
        { title: 'SKU', render: (_, m) => db.products.find((p) => p.id === m.productId)?.sku },
        { title: 'Số lượng', dataIndex: 'quantity' },
        { title: 'Kho trước / sau', render: (_, m) => formatChange(m.warehouseBefore, m.warehouseAfter) },
        { title: 'Ô trước / sau', render: (_, m) => formatChange(m.slotBefore, m.slotAfter) },
        { title: 'Thao tác bởi', dataIndex: 'actor' },
        { title: 'Ghi chú', dataIndex: 'note' },
        { title: 'Thời gian', render: (_, m) => dateTime(m.createdAt) },
      ]}
    />
  )
}
