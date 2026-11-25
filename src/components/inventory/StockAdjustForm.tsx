import { Select } from 'antd'

export function StockAdjustForm({
  scope,
  onScope,
}: {
  scope: 'warehouse' | 'machine'
  onScope: (scope: 'warehouse' | 'machine') => void
}) {
  return (
    <label>
      Vị trí tồn{' '}
      <Select
        aria-label="Vị trí tồn"
        value={scope}
        onChange={onScope}
        options={[
          { value: 'warehouse', label: 'Kho tổng' },
          { value: 'machine', label: 'Ô trong máy' },
        ]}
      />
    </label>
  )
}
