import { Button } from 'antd'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import { cardWallet, nameOf, walletTotals } from '../../stores/selectors'
import type { Card } from '../../types/wallet'
import { DataTable } from '../common/DataTable'
import { StatusTag } from '../common/StatusTag'
import { cardStatus } from '../../static/status'
import { MoneyText } from '../common/MoneyText'
export function CardTable({ rows, onTopUp }: { rows: Card[]; onTopUp?: (id: string) => void }) {
  const db = useAppStore((s) => s.db)
  return (
    <DataTable
      rows={rows}
      columns={[
        {
          title: 'Mã thẻ',
          render: (_, c) => (
            <Link to={'/cards/' + c.id}>
              <strong>{c.code}</strong>
            </Link>
          ),
        },
        {
          title: 'Chủ thẻ',
          render: (_, c) => {
            const owner = cardWallet(db, c.id)?.customerId
            return <Link to={'/customers/' + owner}>{nameOf(db.customers, owner)}</Link>
          },
        },
        { title: 'Số dư ví', render: (_, c) => <MoneyText value={cardWallet(db, c.id)?.balance ?? 0} /> },
        {
          title: 'Tổng nạp ví',
          render: (_, c) => (
            <MoneyText value={walletTotals(db.ledger.filter((e) => e.walletId === c.walletId)).topUp} />
          ),
        },
        {
          title: 'Tổng chi ròng ví',
          render: (_, c) => (
            <MoneyText value={walletTotals(db.ledger.filter((e) => e.walletId === c.walletId)).spend} />
          ),
        },
        {
          title: 'Hạn mức ngày',
          render: (_, c) => (c.dailyLimit === null ? 'Không giới hạn' : <MoneyText value={c.dailyLimit} />),
        },
        {
          title: 'Phạm vi',
          render: (_, c) =>
            c.allowedMachineIds.length
              ? c.allowedMachineIds.map((id) => db.machines.find((m) => m.id === id)?.code).join(', ')
              : 'Tất cả máy',
        },
        { title: 'Trạng thái', render: (_, c) => <StatusTag value={c.status} labels={cardStatus} /> },
        ...(onTopUp
          ? [
              {
                title: 'Thao tác',
                render: (_: unknown, c: Card) =>
                  c.status === 'ACTIVE' &&
                  db.customers.some(
                    (person) => person.id === cardWallet(db, c.id)?.customerId && person.active,
                  ) && (
                    <Button type="link" size="small" onClick={() => onTopUp(c.id)}>
                      Nạp tiền
                    </Button>
                  ),
              },
            ]
          : []),
      ]}
    />
  )
}
