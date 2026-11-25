import { LinkButton } from '../common/LinkButton'
import { Progress } from 'antd'
import machineImage from '../../assets/icons/machine.svg'
import type { Machine } from '../../types/machine'
import { StatusTag } from '../common/StatusTag'
import { machineStatus } from '../../static/status'
import { useAppStore } from '../../stores/useAppStore'
import { machineFill, revenue } from '../../stores/selectors'
import { dateTime } from '../../utils/date'
import { money } from '../../utils/currency'
export function MachineCard({ machine: m }: { machine: Machine }) {
  const db = useAppStore((s) => s.db)
  return (
    <article className="panel panel-pad machine-card">
      <img className="machine-image" src={machineImage} alt="" />
      <h2>{m.name}</h2>
      <p className="muted">
        {m.code} · {m.location}
      </p>
      <p className="flow-note">
        {m.model} · {m.serial}
      </p>
      <div className="flow-note">
        <StatusTag
          value={m.active ? m.status : 'INACTIVE'}
          labels={{ ...machineStatus, INACTIVE: 'Ngừng hoạt động' }}
        />
      </div>
      <p className="flow-note">Lấp đầy</p>
      <Progress percent={machineFill(db, m.id)} />
      <p>
        Doanh thu thuần <strong>{money(revenue(db.orders.filter((o) => o.machineId === m.id)))}</strong>
      </p>
      <small className="muted">Đồng bộ {dateTime(m.lastSeenAt)}</small>
      <div className="inline-actions">
        <LinkButton to={'/machines/' + m.id} type="primary">
          Xem chi tiết
        </LinkButton>
        <LinkButton to={'/machines/' + m.id + '/edit'}>Sửa</LinkButton>
      </div>
    </article>
  )
}
