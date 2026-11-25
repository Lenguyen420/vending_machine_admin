import { useState } from 'react'
import { Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { activeLabels } from '../../static/status'
import { CustomerTable } from '../../components/customers/CustomerTable'
import { CustomerForm } from '../../components/customers/CustomerForm'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters, matches } from '../../hooks/useFilters'
import { customerGroups } from '../../static/constants'
import { options } from '../../static/status'
import type { Customer } from '../../types/wallet'
export default function CustomerListPage() {
  const customers = useAppStore((s) => s.db.customers)
  const f = useFilters()
  const [editing, setEditing] = useState<Customer | null>()
  const rows = customers.filter(
    (c) =>
      matches(f.get('q'), c.name, c.code) &&
      (!f.get('group') || f.get('group') === c.group) &&
      (!f.get('status') || f.get('status') === (c.active ? 'ACTIVE' : 'INACTIVE')),
  )
  return (
    <>
      <PageHeader
        title="Khách hàng"
        description="Quản lý hồ sơ và theo dõi ví của từng khách hàng."
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing(null)}>
            Thêm khách hàng
          </Button>
        }
      />
      <section className="panel panel-pad">
        <SearchFilters
          search={f.get('q')}
          onSearch={(v) => f.set('q', v)}
          placeholder="Tìm tên, mã khách hàng…"
        >
          <FilterSelect
            label="Nhóm"
            value={f.get('group')}
            onChange={(v) => f.set('group', v)}
            options={customerGroups.map((value) => ({ value, label: value }))}
          />
          <FilterSelect
            label="Trạng thái"
            value={f.get('status')}
            onChange={(v) => f.set('status', v)}
            options={options(activeLabels)}
          />
        </SearchFilters>
        <CustomerTable rows={rows} onEdit={setEditing} />
      </section>
      {editing !== undefined && (
        <CustomerForm customer={editing ?? undefined} onClose={() => setEditing(undefined)} />
      )}
    </>
  )
}
