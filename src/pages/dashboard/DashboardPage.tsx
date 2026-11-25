import { useState } from 'react'
import { AlertOutlined, AppstoreOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Segmented, Tabs } from 'antd'
import { StatCard } from '../../components/common/StatCard'
import { PageHeader } from '../../components/common/PageHeader'
import { FilterSelect } from '../../components/common/SearchFilters'
import { DateRange } from '../../components/reports/ReportFilters'
import { SalesChart } from '../../components/reports/SalesChart'
import { PaymentChart } from '../../components/reports/PaymentChart'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { MachineStatusChart } from '../../components/dashboard/MachineStatusChart'
import { LowStockList } from '../../components/dashboard/LowStockList'
import { RecentOrders } from '../../components/dashboard/RecentOrders'
import { useAppStore } from '../../stores/useAppStore'
import { flaggedSlots } from '../../stores/selectors'
import { filterOrders, groupedSales, revenue, sold } from '../../services/reportService'
import type { Period } from '../../services/reportService'
import { dayKey, daysAgo, shortDate } from '../../utils/date'
import { number, money } from '../../utils/currency'
import { methods } from '../../static/status'
export default function DashboardPage() {
  const db = useAppStore((s) => s.db)
  const [range, setRange] = useState(7)
  const [period, setPeriod] = useState<Period>({})
  const [location, setLocation] = useState<string>()
  const active = db.machines.filter((m) => m.active && (!location || m.location === location))
  const locations = [...new Set(db.machines.map((m) => m.location))].map((value) => ({ value, label: value }))
  const today = dayKey()
  const { from = daysAgo(range - 1), to = today } = period
  const orders = filterOrders(db.orders, { from, to, location })
  const todayOrders = filterOrders(db.orders, { from: today, to: today, location })
  const successful = orders.filter((o) => o.status === 'SUCCESS')
  const slots = flaggedSlots(db, new Set(active.map((m) => m.id))).sort((a, b) => a.quantity - b.quantity)
  const points = groupedSales(orders, (o) => dayKey(o.createdAt))
  const dayCount = Math.max(0, Math.min(366, Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1))
  const series = Array.from({ length: dayCount }, (_, i) => {
    const day = daysAgo(dayCount - 1 - i, to + 'T12:00:00+07:00')
    return { name: shortDate(day), net: points.find((p) => p.name === day)?.net ?? 0 }
  })
  const params = new URLSearchParams({ from, to, ...(location ? { location } : {}) })
  const transactionLink = '/transactions?' + params
  return (
    <div className="page-stack">
      <PageHeader
        title="Bảng điều khiển"
        description="Tổng quan doanh thu và tình trạng vận hành các điểm bán."
        actions={
          <>
            <FilterSelect
              label="Tất cả địa điểm"
              value={location}
              onChange={setLocation}
              options={locations}
            />
            <DateRange value={{ from, to }} onChange={setPeriod} />
          </>
        }
      />
      <div className="kpi-grid">
        <StatCard
          title="Máy đang hoạt động"
          value={active.length}
          detail={
            active.filter((m) => m.status === 'ONLINE').length +
            ' trực tuyến · ' +
            active.filter((m) => m.status === 'OFFLINE').length +
            ' ngoại tuyến · ' +
            active.filter((m) => m.status === 'MAINTENANCE').length +
            ' bảo trì'
          }
          icon={<AppstoreOutlined />}
          href={'/machines' + (location ? '?location=' + encodeURIComponent(location) : '')}
        />
        <StatCard
          title="Doanh thu hôm nay"
          value={money(revenue(todayOrders))}
          detail="Doanh thu thuần sau hoàn tiền"
          icon={<DollarOutlined />}
          tone="green"
          href={
            '/transactions?' +
            new URLSearchParams({ from: today, to: today, ...(location ? { location } : {}) })
          }
        />
        <StatCard
          title="Đơn thành công"
          value={number(successful.length)}
          detail={number(orders.filter(sold).reduce((sum, o) => sum + o.quantity, 0)) + ' sản phẩm đã xuất'}
          icon={<ShoppingCartOutlined />}
          tone="purple"
          href={transactionLink + '&status=SUCCESS'}
        />
        <StatCard
          title="Ô cần tiếp hàng"
          value={slots.length}
          detail={
            slots.filter((s) => s.quantity === 0).length +
            ' hết hàng · ' +
            slots.filter((s) => s.quantity > 0).length +
            ' sắp hết'
          }
          icon={<AlertOutlined />}
          tone="orange"
          href={
            '/alerts?' +
            new URLSearchParams({ group: 'stock', status: 'active', ...(location ? { location } : {}) })
          }
        />
      </div>
      <div className="two-col">
        <section className="panel panel-pad">
          <div className="panel-title">
            <div>
              <h2>Doanh thu</h2>
              <p>
                {shortDate(from)} – {shortDate(to)} · VNĐ
              </p>
            </div>
            <Segmented
              value={range}
              options={[
                { value: 7, label: '7 ngày' },
                { value: 30, label: '30 ngày' },
              ]}
              onChange={(value) => {
                setRange(value)
                setPeriod({})
              }}
            />
          </div>
          <Tabs
            size="small"
            items={[
              { key: 'daily', label: 'Theo ngày', children: <RevenueChart data={series} /> },
              {
                key: 'machine',
                label: 'Theo máy',
                children: (
                  <SalesChart
                    data={groupedSales(
                      orders,
                      (o) => db.machines.find((m) => m.id === o.machineId)?.code ?? o.machineName,
                    )}
                  />
                ),
              },
              {
                key: 'method',
                label: 'Thanh toán',
                children: <PaymentChart data={groupedSales(orders, (o) => methods[o.method])} />,
              },
            ]}
          />
        </section>
        <section className="panel panel-pad">
          <div className="panel-title">
            <div>
              <h2>Tình trạng máy</h2>
              <p>Các máy đang được quản lý</p>
            </div>
          </div>
          <MachineStatusChart machines={active} location={location} />
        </section>
      </div>
      <div className="two-col">
        <RecentOrders orders={orders} href={transactionLink} />
        <LowStockList slots={slots} location={location} />
      </div>
    </div>
  )
}
