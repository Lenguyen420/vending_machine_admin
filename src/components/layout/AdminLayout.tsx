import { useState } from 'react'
import { Drawer } from 'antd'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  return (
    <div className={'admin-layout' + (collapsed ? ' sidebar-narrow' : '')}>
      <div className="desktop-sidebar">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>
      <Drawer
        title="Điều hướng"
        placement="left"
        size={248}
        open={mobile}
        onClose={() => setMobile(false)}
        className="mobile-drawer"
      >
        <Sidebar collapsed={false} onToggle={() => setMobile(false)} onNavigate={() => setMobile(false)} />
      </Drawer>
      <div className="main-shell">
        <Header onMenu={() => setMobile(true)} />
        <main className="main-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
