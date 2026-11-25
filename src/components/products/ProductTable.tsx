import { Button } from 'antd'
import type { Product } from '../../types/product'
import { useAppStore } from '../../stores/useAppStore'
import { DataTable } from '../common/DataTable'
import { MoneyText } from '../common/MoneyText'
import { ProductImage } from '../common/ProductImage'
import { StatusTag } from '../common/StatusTag'
import { activeLabels } from '../../static/status'
import { nameOf } from '../../stores/selectors'
export function ProductTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: Product[]
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
}) {
  const categories = useAppStore((s) => s.db.categories)
  return (
    <DataTable
      rows={rows}
      columns={[
        {
          title: 'Sản phẩm',
          render: (_, p) => (
            <div className="cell-media">
              <ProductImage image={p.image} />
              <div>
                <strong>{p.name}</strong>
                <small className="cell-caption">{p.sku}</small>
              </div>
            </div>
          ),
        },
        { title: 'Barcode', dataIndex: 'barcode' },
        { title: 'Danh mục', render: (_, p) => nameOf(categories, p.categoryId) },
        { title: 'Giá nhập', render: (_, p) => <MoneyText value={p.cost} /> },
        { title: 'Giá bán mặc định', render: (_, p) => <MoneyText value={p.price} /> },
        { title: 'Đơn vị', dataIndex: 'unit' },
        {
          title: 'Trạng thái',
          render: (_, p) => <StatusTag value={p.active ? 'ACTIVE' : 'INACTIVE'} labels={activeLabels} />,
        },
        {
          title: 'Thao tác',
          render: (_, p) => (
            <div className="inline-actions">
              <Button type="link" size="small" onClick={() => onEdit(p)}>
                Sửa
              </Button>
              <Button danger type="link" size="small" onClick={() => onDelete(p)}>
                Xóa
              </Button>
            </div>
          ),
        },
      ]}
    />
  )
}
