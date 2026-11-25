import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money } from '../../utils/currency'
export function SalesChart({ data }: { data: { name: string; net: number }[] }) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e9eef5" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            width={54}
            tickFormatter={(value) => Math.round(value / 1000) + 'k'}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [money(Number(value)), 'Doanh thu thuần']} />
          <Bar dataKey="net" fill="#4079ea" radius={[5, 5, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
