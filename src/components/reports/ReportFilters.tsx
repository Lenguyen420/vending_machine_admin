import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import { FilterSelect, SearchFilters } from '../common/SearchFilters'
import type { OrderFilter, Period } from '../../services/reportService'
import { useAppStore } from '../../stores/useAppStore'
import { methods, options } from '../../static/status'
export function DateRange({ value, onChange }: { value: Period; onChange: (value: Period) => void }) {
  return (
    <div className="report-range">
      <DatePicker.RangePicker
        allowEmpty={[true, true]}
        format="DD/MM/YYYY"
        placeholder={['Từ ngày', 'Đến ngày']}
        value={[value.from ? dayjs(value.from) : null, value.to ? dayjs(value.to) : null]}
        onChange={(dates) =>
          onChange({ from: dates?.[0]?.format('YYYY-MM-DD'), to: dates?.[1]?.format('YYYY-MM-DD') })
        }
      />
    </div>
  )
}
export function ReportFilters({
  value,
  onChange,
}: {
  value: OrderFilter
  onChange: (value: OrderFilter) => void
}) {
  const { machines, products } = useAppStore((s) => s.db)
  return (
    <SearchFilters>
      <DateRange value={value} onChange={(period) => onChange({ ...value, ...period })} />
      <FilterSelect
        label="Máy bán hàng"
        value={value.machineId}
        onChange={(machineId) => onChange({ ...value, machineId })}
        options={machines.map((m) => ({ value: m.id, label: m.code + ' · ' + m.name }))}
      />
      <FilterSelect
        label="Phương thức"
        value={value.method}
        onChange={(method) => onChange({ ...value, method })}
        options={options(methods)}
      />
      <FilterSelect
        label="Sản phẩm"
        value={value.productId}
        onChange={(productId) => onChange({ ...value, productId })}
        options={products.map((p) => ({ value: p.id, label: p.sku + ' · ' + p.name }))}
      />
    </SearchFilters>
  )
}
