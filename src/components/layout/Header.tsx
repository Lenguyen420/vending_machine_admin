import { Avatar, Badge, Button, Dropdown } from 'antd'
import { BellOutlined, MenuOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { openAlerts } from '../../stores/selectors'
import { useAppStore } from '../../stores/useAppStore'
import { Breadcrumbs } from './Breadcrumbs'
export function Header({ onMenu }: { onMenu: () => void }) {
  const count = useAppStore((s) => openAlerts(s.db).filter((a) => a.status === 'OPEN').length)
  return (
    <header className="topbar">
      <div className="topbar-start">
        <Button
          className="mobile-menu"
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenu}
          aria-label="Mở điều hướng"
        />
        <Breadcrumbs />
      </div>
      <div className="topbar-end">
        <span className="demo-label">
          <i />
          Dữ liệu mô phỏng
        </span>
        <Link
          to="/alerts?status=OPEN"
          className="notification-link"
          aria-label={'Cảnh báo chưa đọc: ' + count}
        >
          <Badge count={count} size="small">
            <BellOutlined />
          </Badge>
        </Link>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: <Link to="/settings">Cài đặt ứng dụng</Link>,
              },
            ],
          }}
        >
          <button className="avatar-button" aria-label="Menu Admin">
            <Avatar size={34} icon={<UserOutlined />} />
            <span>
              <strong>Admin</strong>
              <small>Quản trị viên</small>
            </span>
          </button>
        </Dropdown>
      </div>
    </header>
  )
}
