import { LinkButton } from '../../components/common/LinkButton'
import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import type { Category } from '../../types/product'
import { CategoryForm } from '../../components/products/CategoryForm'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { DataTable } from '../../components/common/DataTable'
import { StatusTag } from '../../components/common/StatusTag'
import { activeLabels } from '../../static/status'
import { useAction } from '../../components/common/ConfirmDialog'
import { options } from '../../static/status'
export default function CategoryPage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const { confirm } = useAction()
  const [editing, setEditing] = useState<Category | null>()
  const rows = db.categories.filter(
    (c) =>
      matches(f.get('q'), c.name) &&
      (!f.get('status') || f.get('status') === (c.active ? 'ACTIVE' : 'INACTIVE')),
  )
  return (
    <>
      <PageHeader
        title="Danh mục sản phẩm"
        description="Sắp xếp sản phẩm theo nhóm hàng."
        actions={
          <>
            <LinkButton to="/products">Danh sách sản phẩm</LinkButton>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>
              Thêm danh mục
            </Button>
          </>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters search={f.get('q')} onSearch={(v) => f.set('q', v)}>
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options(activeLabels)}
          />
        </SearchFilters>
        <DataTable
          rows={rows}
          columns={[
            { title: 'Danh mục', dataIndex: 'name' },
            {
              title: 'Số sản phẩm',
              render: (_, c) => (
                <Link to={'/products?category=' + c.id}>
                  {db.products.filter((p) => p.categoryId === c.id).length}
                </Link>
              ),
            },
            {
              title: 'Trạng thái',
              render: (_, c) => <StatusTag value={c.active ? 'ACTIVE' : 'INACTIVE'} labels={activeLabels} />,
            },
            {
              title: 'Thao tác',
              render: (_, c) => (
                <div className="inline-actions">
                  <Button type="link" size="small" onClick={() => setEditing(c)}>
                    Sửa
                  </Button>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() =>
                      confirm(
                        'Xóa danh mục',
                        c.name,
                        () => useAppStore.getState().deleteCategory(c.id),
                        'Đã xóa danh mục',
                      )
                    }
                  >
                    Xóa
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </section>
      {editing !== undefined && (
        <CategoryForm category={editing ?? undefined} onClose={() => setEditing(undefined)} />
      )}
    </>
  )
}
