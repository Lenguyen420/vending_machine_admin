import { Progress } from 'antd'
import { Link } from 'react-router-dom'
import machineImage from '../../assets/icons/machine.svg'
import type { Machine } from '../../types/machine'
import { DataTable } from '../common/DataTable'
import { MoneyText } from '../common/MoneyText'
import { StatusTag } from '../common/StatusTag'
import { machineStatus } from '../../static/status'
import { useAppStore } from '../../stores/useAppStore'
import { machineFill, revenue } from '../../stores/selectors'
import { dateTime } from '../../utils/date'
export function MachineTable({ rows }: { rows: Machine[] }) {
  const db = useAppStore((s) => s.db)
  return (
    <DataTable
      rows={rows}
      columns={[
        {
          title: 'Máy bán hàng',
          render: (_, m) => (
            <div className="cell-media">
              <img className="machine-thumb" src={machineImage} alt="" />
              <div>
                <Link to={'/machines/' + m.id}>
                  <strong>{m.name}</strong>
                </Link>
                <small className="cell-caption">{m.code}</small>
              </div>
            </div>
          ),
        },
        { title: 'Địa điểm', dataIndex: 'location' },
        {
          title: 'Model / Serial',
          render: (_, m) => (
            <>
              {m.model}
              <small className="cell-caption">{m.serial}</small>
            </>
          ),
        },
        {
          title: 'Kết nối',
          render: (_, m) => (
            <StatusTag
              value={m.active ? m.status : 'INACTIVE'}
              labels={{ ...machineStatus, INACTIVE: 'Ngừng hoạt động' }}
            />
          ),
        },
        {
          title: 'Lấp đầy',
          render: (_, m) => <Progress size="small" style={{ width: 85 }} percent={machineFill(db, m.id)} />,
        },
        {
          title: 'Doanh thu thuần',
          render: (_, m) => <MoneyText value={revenue(db.orders.filter((o) => o.machineId === m.id))} />,
        },
        { title: 'Đồng bộ cuối', render: (_, m) => dateTime(m.lastSeenAt) },
        { title: 'Thao tác', render: (_, m) => <Link to={'/machines/' + m.id + '/edit'}>Sửa</Link> },
      ]}
    />
  )
}
