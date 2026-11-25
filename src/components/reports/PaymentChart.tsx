import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { money } from '../../utils/currency'
export function PaymentChart({ data }: { data: { name: string; net: number }[] }) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ right: 14 }}>
          <XAxis
            type="number"
            tickFormatter={(value) => Math.round(value / 1000) + 'k'}
            tick={{ fontSize: 12 }}
          />
          <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [money(Number(value)), 'Doanh thu thuần']} />
          <Bar dataKey="net" fill="#31a990" radius={[0, 5, 5, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
