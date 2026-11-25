import { useState } from 'react'
import { Button, Segmented, Tabs } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { DataTable } from '../../components/common/DataTable'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { MoneyText } from '../../components/common/MoneyText'
import { DateRange, ReportFilters } from '../../components/reports/ReportFilters'
import { SalesChart } from '../../components/reports/SalesChart'
import { WalletHistory } from '../../components/cards/WalletHistory'
import { StockTable } from '../../components/inventory/StockTable'
import { useAppStore } from '../../stores/useAppStore'
import { productStock } from '../../stores/selectors'
import { filterOrders, groupedSales, inPeriod, selectRefunds } from '../../services/reportService'
import type { OrderFilter, Period } from '../../services/reportService'
import { warehouseQuantity } from '../../services/inventoryService'
import { methods } from '../../static/status'
import { topUpMethods } from '../../static/constants'
import { dateTime, dayKey, daysAgo } from '../../utils/date'
import { downloadCsv } from '../../utils/csv'
import { shortId } from '../../utils/id'
type Tab = 'sales' | 'stock' | 'topups' | 'refunds'
type Group = 'day' | 'machine' | 'sku' | 'method'
const groupNames: Record<Group, string> = {
  day: 'Theo ngày',
  machine: 'Theo máy',
  sku: 'Theo SKU',
  method: 'Theo phương thức',
}
export default function ReportsPage() {
  const db = useAppStore((s) => s.db)
  const [tab, setTab] = useState<Tab>('sales')
  const [group, setGroup] = useState<Group>('day')
  const [filter, setFilter] = useState<OrderFilter>(() => ({ from: daysAgo(29), to: dayKey() }))
  const [stock, setStock] = useState<{ machineId?: string; productId?: string }>({})
  const [wallet, setWallet] = useState<Period & { method?: string; cardId?: string }>(() => ({
    from: daysAgo(29),
    to: dayKey(),
  }))
  const groups = {
    day: (o: (typeof db.orders)[number]) => dayKey(o.createdAt),
    machine: (o: (typeof db.orders)[number]) =>
      db.machines.find((m) => m.id === o.machineId)?.code ?? o.machineName,
    sku: (o: (typeof db.orders)[number]) => o.sku,
    method: (o: (typeof db.orders)[number]) => methods[o.method],
  }
  const saleRows = groupedSales(filterOrders(db.orders, filter), groups[group])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((row) => ({ ...row, id: row.name }))
  const stockRows = db.products.filter(
    (p) =>
      (!stock.productId || stock.productId === p.id) &&
      (!stock.machineId ||
        db.slots.some((s) => !s.retired && s.machineId === stock.machineId && s.productId === p.id)),
  )
  const topUps = db.ledger.filter(
    (e) =>
      e.type === 'TOP_UP' &&
      inPeriod(e.createdAt, wallet) &&
      (!wallet.method || wallet.method === e.method) &&
      (!wallet.cardId || wallet.cardId === e.cardId),
  )
  const refundRows = selectRefunds(db, filter)
  const exportReport = () => {
    if (tab === 'sales')
      downloadCsv('bao-cao-doanh-thu', [
        [groupNames[group], 'Đã xuất', 'Doanh số gộp', 'Đã hoàn', 'Doanh thu thuần'],
        ...saleRows.map((r) => [r.name, r.quantity, r.gross, r.refunded, r.net]),
      ])
    else if (tab === 'stock')
      downloadCsv('bao-cao-ton-kho', [
        ['SKU', 'Sản phẩm', 'Đơn vị', 'Kho tổng', 'Máy', 'Tồn tại máy'],
        ...stockRows.map((p) => [
          p.sku,
          p.name,
          p.unit,
          warehouseQuantity(db, p.id),
          db.machines.find((m) => m.id === stock.machineId)?.code ?? 'Tất cả máy',
          productStock(db, p.id, stock.machineId),
        ]),
      ])
    else if (tab === 'topups')
      downloadCsv('bao-cao-nap-tien', [
        [
          'Mã giao dịch',
          'Mã thẻ',
          'Số tiền',
          'Trước',
          'Sau',
          'Phương thức',
          'Thao tác bởi',
          'Ghi chú',
          'Thời gian',
        ],
        ...topUps.map((e) => [
          e.referenceId,
          db.cards.find((c) => c.id === e.cardId)?.code,
          e.amount,
          e.before,
          e.after,
          e.method,
          e.actor,
          e.note,
          dateTime(e.createdAt),
        ]),
      ])
    else
      downloadCsv('bao-cao-hoan-tien', [
        ['Mã hoàn', 'Mã đơn', 'Phương thức', 'Số tiền', 'Lý do', 'Thao tác bởi', 'Ngày hoàn'],
        ...refundRows.map((r) => {
          const o = db.orders.find((item) => item.id === r.orderId)
          return [
            r.id,
            r.orderId,
            o ? methods[o.method] : null,
            r.amount,
            r.reason,
            r.actor,
            dateTime(r.createdAt),
          ]
        }),
      ])
  }
  return (
    <>
      <PageHeader
        title="Báo cáo"
        description="Phân tích doanh thu, tồn kho, nạp tiền và hoàn tiền."
        actions={
          <Button type="primary" icon={<DownloadOutlined />} onClick={exportReport}>
            Xuất CSV
          </Button>
        }
      />
      <section className="panel panel-pad">
        <Tabs
          activeKey={tab}
          onChange={(key) => setTab(key as Tab)}
          items={[
            {
              key: 'sales',
              label: 'Doanh thu',
              children: (
                <div className="form-flow">
                  <ReportFilters value={filter} onChange={setFilter} />
                  <div className="panel-title">
                    <div>
                      <h2>Doanh thu thuần theo ngày bán</h2>
                      <p>Hoàn tiền được tính vào ngày bán của đơn đã xuất hàng.</p>
                    </div>
                    <Segmented
                      aria-label="Nhóm doanh thu"
                      value={group}
                      onChange={setGroup}
                      options={Object.entries(groupNames).map(([value, label]) => ({
                        value: value as Group,
                        label,
                      }))}
                    />
                  </div>
                  {saleRows.length > 0 && (
                    <SalesChart
                      data={saleRows.map((row) => ({
                        ...row,
                        name: group === 'day' ? row.name.slice(5) : row.name,
                      }))}
                    />
                  )}
                  <DataTable
                    rows={saleRows}
                    columns={[
                      { title: groupNames[group], dataIndex: 'name' },
                      { title: 'Đã xuất', dataIndex: 'quantity' },
                      { title: 'Doanh số gộp', render: (_, r) => <MoneyText value={r.gross} /> },
                      { title: 'Đã hoàn', render: (_, r) => <MoneyText value={r.refunded} /> },
                      { title: 'Doanh thu thuần', render: (_, r) => <MoneyText value={r.net} /> },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'stock',
              label: 'Tồn kho',
              children: (
                <>
                  <SearchFilters>
                    <FilterSelect
                      label="Máy bán hàng"
                      value={stock.machineId}
                      onChange={(machineId) => setStock({ ...stock, machineId })}
                      options={db.machines.map((m) => ({ value: m.id, label: m.code }))}
                    />
                    <FilterSelect
                      label="Sản phẩm"
                      value={stock.productId}
                      onChange={(productId) => setStock({ ...stock, productId })}
                      options={db.products.map((p) => ({ value: p.id, label: p.sku + ' · ' + p.name }))}
                    />
                  </SearchFilters>
                  <StockTable products={stockRows} machineId={stock.machineId} />
                </>
              ),
            },
            {
              key: 'topups',
              label: 'Nạp tiền',
              children: (
                <>
                  <SearchFilters>
                    <DateRange value={wallet} onChange={(v) => setWallet({ ...wallet, ...v })} />
                    <FilterSelect
                      label="Phương thức nạp"
                      value={wallet.method}
                      onChange={(method) => setWallet({ ...wallet, method })}
                      options={topUpMethods.map((value) => ({ value, label: value }))}
                    />
                    <FilterSelect
                      label="Thẻ nội bộ"
                      value={wallet.cardId}
                      onChange={(cardId) => setWallet({ ...wallet, cardId })}
                      options={db.cards.map((c) => ({ value: c.id, label: c.code }))}
                    />
                  </SearchFilters>
                  <p className="flow-note">
                    Tổng nạp{' '}
                    <strong>
                      <MoneyText value={topUps.reduce((sum, e) => sum + e.amount, 0)} />
                    </strong>
                  </p>
                  <WalletHistory rows={topUps} />
                </>
              ),
            },
            {
              key: 'refunds',
              label: 'Hoàn tiền',
              children: (
                <>
                  <ReportFilters value={filter} onChange={setFilter} />
                  <p className="flow-note">
                    Tổng theo ngày hoàn{' '}
                    <strong>
                      <MoneyText value={refundRows.reduce((sum, r) => sum + r.amount, 0)} />
                    </strong>
                  </p>
                  <DataTable
                    rows={refundRows}
                    columns={[
                      { title: 'Mã hoàn', render: (_, r) => shortId(r.id) },
                      {
                        title: 'Đơn hàng',
                        render: (_, r) => <Link to={'/transactions/' + r.orderId}>{shortId(r.orderId)}</Link>,
                      },
                      { title: 'Số tiền', render: (_, r) => <MoneyText value={r.amount} /> },
                      { title: 'Lý do', dataIndex: 'reason' },
                      { title: 'Thao tác bởi', dataIndex: 'actor' },
                      { title: 'Ngày hoàn', render: (_, r) => dateTime(r.createdAt) },
                    ]}
                  />
                </>
              ),
            },
          ]}
        />
      </section>
    </>
  )
}
