import { Progress } from 'antd'
import type { Machine } from '../../types/machine'
import { useAppStore } from '../../stores/useAppStore'
import { machineFill, machineSlots, openAlerts, revenue } from '../../stores/selectors'
import { money } from '../../utils/currency'
import { dateTime } from '../../utils/date'
import { methods } from '../../static/status'
export function MachineOverview({ machine: m }: { machine: Machine }) {
  const db = useAppStore((s) => s.db)
  const data = {
    'Mã máy': m.code,
    'Địa điểm': m.location,
    Model: m.model,
    Serial: m.serial,
    'Phụ trách': m.manager,
    'Đồng bộ cuối': dateTime(m.lastSeenAt),
    'Số ô': machineSlots(db, m.id).length,
    'Doanh thu thuần': money(revenue(db.orders.filter((o) => o.machineId === m.id))),
    'Cảnh báo đang mở': openAlerts(db, m.id).length,
    'Thanh toán': m.methods.map((item) => methods[item]).join(', ') || 'Chưa bật',
  }
  return (
    <>
      <dl className="detail-list">
        {Object.entries(data).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="flow-note">Mức lấp đầy</p>
      <Progress percent={machineFill(db, m.id)} />
    </>
  )
}
