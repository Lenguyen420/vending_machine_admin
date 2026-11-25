import { Table } from 'antd'
import type { TableProps } from 'antd'
import { EmptyState } from './EmptyState'
import { usePagination } from '../../hooks/usePagination'
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  compact = false,
}: {
  rows: T[]
  columns: TableProps<T>['columns']
  compact?: boolean
}) {
  const pagination = usePagination()
  return (
    <Table<T>
      rowKey="id"
      size={compact ? 'small' : 'middle'}
      dataSource={rows}
      columns={columns}
      scroll={{ x: 'max-content' }}
      locale={{ emptyText: <EmptyState /> }}
      pagination={compact && rows.length <= 5 ? false : pagination}
    />
  )
}
