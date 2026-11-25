import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money } from '../../utils/currency'
export function RevenueChart({ data }: { data: { name: string; net: number }[] }) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 14, bottom: 0, left: 1 }}>
          <CartesianGrid stroke="#e9eef5" vertical={false} />
          <XAxis
            dataKey="name"
            minTickGap={22}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#607086', fontSize: 12 }}
          />
          <YAxis
            width={58}
            tickFormatter={(v) => (v >= 1000 ? Math.round(v / 1000) + 'k' : String(v))}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#607086', fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [money(Number(value)), 'Doanh thu thuần']} />
          <defs>
            <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="net"
            stroke="#2563eb"
            strokeWidth={2.5}
            fill="url(#revenue-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
