import { LinkButton } from '../../components/common/LinkButton'
import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { useAction } from '../../components/common/ConfirmDialog'
import { activeLabels } from '../../static/status'
import { ProductTable } from '../../components/products/ProductTable'
import { ProductForm } from '../../components/products/ProductForm'
import { useAppStore } from '../../stores/useAppStore'
import { matches, useFilters } from '../../hooks/useFilters'
import type { Product } from '../../types/product'
import { options } from '../../static/status'
export default function ProductListPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const { confirm } = useAction()
  const [editing, setEditing] = useState<Product | null>()
  const rows = db.products.filter(
    (p) =>
      matches(f.get('q'), p.name, p.sku, p.barcode) &&
      (!f.get('category') || p.categoryId === f.get('category')) &&
      (!f.get('status') || f.get('status') === (p.active ? 'ACTIVE' : 'INACTIVE')),
  )
  return (
    <>
      <PageHeader
        title="Sản phẩm"
        description="Quản lý SKU, danh mục và giá bán."
        actions={
          <>
            <LinkButton to="/products/categories">Danh mục</LinkButton>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>
              Thêm sản phẩm
            </Button>
          </>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm tên, SKU, barcode…"
        >
          <FilterSelect
            label="Danh mục"
            value={f.get('category')}
            onChange={(v) => f.set('category', v)}
            options={db.categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options(activeLabels)}
          />
        </SearchFilters>
        <ProductTable
          rows={rows}
          onEdit={setEditing}
          onDelete={(p) =>
            confirm(
              'Xóa sản phẩm',
              p.name,
              () => useAppStore.getState().deleteProduct(p.id),
              'Đã xóa sản phẩm',
            )
          }
        />
      </section>
      {editing !== undefined && (
        <ProductForm product={editing ?? undefined} onClose={() => setEditing(undefined)} />
      )}
    </>
  )
}
