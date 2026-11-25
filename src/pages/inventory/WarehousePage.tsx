import { LinkButton } from '../../components/common/LinkButton'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { StockTable } from '../../components/inventory/StockTable'
import { useAppStore } from '../../stores/useAppStore'
import { matches, useFilters } from '../../hooks/useFilters'
export default function WarehousePage() {
  const db = useAppStore((s) => s.db)
  const f = useFilters()
  const rows = db.products.filter(
    (p) =>
      matches(f.get('q'), p.name, p.sku, p.barcode) &&
      (!f.get('category') || f.get('category') === p.categoryId) &&
      (!f.get('machine') ||
        db.slots.some((s) => !s.retired && s.machineId === f.get('machine') && s.productId === p.id)),
  )
  return (
    <>
      <PageHeader
        title="Kho hàng"
        description="Tra cứu số lượng trong kho tổng và tại từng điểm bán."
        actions={
          <>
            <LinkButton to="/inventory/history">Lịch sử kho</LinkButton>
            <LinkButton to="/inventory/restock" type="primary" icon={<PlusOutlined />}>
              Thao tác tồn kho
            </LinkButton>
          </>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters search={f.get('q')} onSearch={(v) => f.set('q', v)} placeholder="Tìm sản phẩm, SKU…">
          <FilterSelect
            label="Danh mục"
            value={f.get('category')}
            onChange={(v) => f.set('category', v)}
            options={db.categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <FilterSelect
            label="Tất cả máy"
            value={f.get('machine')}
            onChange={(v) => f.set('machine', v)}
            options={db.machines.map((m) => ({ value: m.id, label: m.code + ' · ' + m.name }))}
          />
        </SearchFilters>
        <StockTable products={rows} machineId={f.get('machine')} />
      </section>
    </>
  )
}
