import { Link } from 'react-router-dom'
import { DataTable } from '../common/DataTable'
import { ProductImage } from '../common/ProductImage'
import type { Product } from '../../types/product'
import { useAppStore } from '../../stores/useAppStore'
import { productStock } from '../../stores/selectors'
import { warehouseQuantity } from '../../services/inventoryService'
export function StockTable({ products, machineId }: { products: Product[]; machineId?: string }) {
  const db = useAppStore((s) => s.db)
  return (
    <DataTable
      rows={products}
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
        { title: 'Đơn vị', dataIndex: 'unit' },
        { title: 'Kho tổng', render: (_, p) => warehouseQuantity(db, p.id) },
        {
          title: machineId ? 'Tồn tại máy đã chọn' : 'Tồn tại các máy',
          render: (_, p) => productStock(db, p.id, machineId),
        },
        ...(!machineId
          ? [
              {
                title: 'Tổng tồn',
                render: (_: unknown, p: Product) => warehouseQuantity(db, p.id) + productStock(db, p.id),
              },
            ]
          : []),
        {
          title: 'Thao tác',
          render: (_, p) => <Link to={'/inventory/restock?type=IMPORT&product=' + p.id}>Nhập kho</Link>,
        },
      ]}
    />
  )
}
