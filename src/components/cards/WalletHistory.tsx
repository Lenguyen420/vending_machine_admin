import { Link } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import type { WalletEntry } from '../../types/wallet'
import { DataTable } from '../common/DataTable'
import { MoneyText } from '../common/MoneyText'
import { walletTypes } from '../../static/status'
import { dateTime } from '../../utils/date'
import { shortId } from '../../utils/id'
export function WalletHistory({ rows }: { rows: WalletEntry[] }) {
  const cards = useAppStore((s) => s.db.cards)
  return (
    <DataTable
      rows={rows}
      columns={[
        { title: 'Mã giao dịch', render: (_, e) => shortId(e.referenceId) },
        {
          title: 'Thẻ',
          render: (_, e) =>
            e.cardId ? (
              <Link to={'/cards/' + e.cardId}>{cards.find((c) => c.id === e.cardId)?.code}</Link>
            ) : (
              '—'
            ),
        },
        { title: 'Loại', render: (_, e) => walletTypes[e.type] },
        { title: 'Số tiền', render: (_, e) => <MoneyText value={e.amount} /> },
        { title: 'Số dư trước', render: (_, e) => <MoneyText value={e.before} /> },
        { title: 'Số dư sau', render: (_, e) => <MoneyText value={e.after} /> },
        { title: 'Phương thức', render: (_, e) => e.method ?? '—' },
        { title: 'Ghi chú', render: (_, e) => e.note || '—' },
        { title: 'Thao tác bởi', dataIndex: 'actor' },
        { title: 'Thời gian', render: (_, e) => dateTime(e.createdAt) },
      ]}
    />
  )
}
