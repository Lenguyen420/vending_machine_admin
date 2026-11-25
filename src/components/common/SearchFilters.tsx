import { Input, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'
export function SearchFilters({
  search,
  onSearch,
  placeholder = 'Tìm kiếm…',
  children,
}: {
  search?: string
  onSearch?: (value: string) => void
  placeholder?: string
  children?: ReactNode
}) {
  return (
    <div className="filters">
      {onSearch && (
        <Input
          allowClear
          className="filter-search"
          prefix={<SearchOutlined />}
          aria-label={placeholder}
          placeholder={placeholder}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      )}
      {children}
    </div>
  )
}
export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value?: string
  onChange: (value?: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select
      aria-label={label}
      allowClear
      className="filter-select"
      placeholder={label}
      value={value || undefined}
      onChange={onChange}
      options={options}
      popupMatchSelectWidth={false}
    />
  )
}
