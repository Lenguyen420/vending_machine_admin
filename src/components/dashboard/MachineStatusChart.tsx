import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'
import type { Machine } from '../../types/machine'
import { machineStatus } from '../../static/status'
const colors = ['#20a872', '#e2586a', '#ed9b2b']
export function MachineStatusChart({ machines, location }: { machines: Machine[]; location?: string }) {
  const data = (Object.keys(machineStatus) as Machine['status'][]).map((key, i) => ({
    key,
    name: machineStatus[key],
    count: machines.filter((m) => m.status === key).length,
    color: colors[i],
  }))
  return (
    <>
      <div className="status-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={machines.length ? data : [{ name: 'Chưa có máy', count: 1, color: '#e7edf6' }]}
              dataKey="count"
              nameKey="name"
              innerRadius="65%"
              outerRadius="91%"
              paddingAngle={machines.length > 1 ? 3 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {(machines.length ? data : [{ color: '#e7edf6' }]).map((e) => (
                <Cell key={e.color} fill={e.color} />
              ))}
            </Pie>
            {machines.length > 0 && <Tooltip />}
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-label">
          <strong>{machines.length}</strong>
          <small>máy</small>
        </div>
      </div>
      <ul className="chart-key">
        {data.map((entry) => (
          <li key={entry.key}>
            <Link
              to={
                '/machines?' + new URLSearchParams({ status: entry.key, ...(location ? { location } : {}) })
              }
            >
              <i style={{ background: entry.color }} />
              {entry.name}
              <strong>{entry.count}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
