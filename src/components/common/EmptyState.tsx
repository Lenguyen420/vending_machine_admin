import { Empty } from 'antd'
export function EmptyState({ description = 'Không có dữ liệu phù hợp' }: { description?: string }) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
}
