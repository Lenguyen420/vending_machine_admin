import { NavLink } from 'react-router-dom'
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons'
import { groups } from '../../static/menu'
import { useAppStore } from '../../stores/useAppStore'
export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  const name = useAppStore((s) => s.db.settings.displayName)
  return (
    <aside className={'sidebar' + (collapsed ? ' collapsed' : '')}>
      <NavLink className="brand" to="/" onClick={onNavigate}>
        <img src="/favicon.svg" alt="" />
        <span>
          <strong>{name}</strong>
          <small>Quản lý máy bán hàng</small>
        </span>
      </NavLink>
      <nav aria-label="Điều hướng chính">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map(({ path, label, icon: Icon }) => (
              <NavLink to={path} end={path === '/'} key={path} title={label} onClick={onNavigate}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <button
        className="collapse-button"
        onClick={onToggle}
        aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
      >
        {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
        <span>Thu gọn thanh bên</span>
      </button>
    </aside>
  )
}
