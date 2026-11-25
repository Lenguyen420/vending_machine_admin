import { Button } from 'antd'
import { Link } from 'react-router-dom'
import type { Customer } from '../../types/wallet'
import { useAppStore } from '../../stores/useAppStore'
import { DataTable } from '../common/DataTable'
import { MoneyText } from '../common/MoneyText'
import { StatusTag } from '../common/StatusTag'
import { activeLabels } from '../../static/status'
export function CustomerTable({ rows, onEdit }: { rows: Customer[]; onEdit: (customer: Customer) => void }) {
  const db = useAppStore((s) => s.db)
  return (
    <DataTable
      rows={rows}
      columns={[
        {
          title: 'Khách hàng',
          render: (_, c) => (
            <div>
              <Link to={'/customers/' + c.id}>
                <strong>{c.name}</strong>
              </Link>
              <small className="cell-caption">{c.code}</small>
            </div>
          ),
        },
        { title: 'Nhóm', dataIndex: 'group' },
        {
          title: 'Số dư ví',
          render: (_, c) => <MoneyText value={db.wallets.find((w) => w.customerId === c.id)?.balance ?? 0} />,
        },
        {
          title: 'Số thẻ',
          render: (_, c) =>
            db.cards.filter((item) => item.walletId === db.wallets.find((w) => w.customerId === c.id)?.id)
              .length,
        },
        {
          title: 'Trạng thái',
          render: (_, c) => <StatusTag value={c.active ? 'ACTIVE' : 'INACTIVE'} labels={activeLabels} />,
        },
        {
          title: 'Thao tác',
          render: (_, c) => (
            <Button type="link" size="small" onClick={() => onEdit(c)}>
              Sửa
            </Button>
          ),
        },
      ]}
    />
  )
}
