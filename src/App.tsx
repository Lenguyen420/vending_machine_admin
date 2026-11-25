import { lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/layout/AdminLayout'
import { routes } from './static/routes'
import NotFoundPage from './pages/NotFoundPage'
import './css/dashboard.css'
const pages = [
  { path: routes.dashboard, Component: lazy(() => import('./pages/dashboard/DashboardPage')) },
  { path: routes.machines, Component: lazy(() => import('./pages/machines/MachineListPage')) },
  { path: routes.machineCreate, Component: lazy(() => import('./pages/machines/MachineCreatePage')) },
  { path: routes.machine, Component: lazy(() => import('./pages/machines/MachineDetailPage')) },
  { path: routes.machineEdit, Component: lazy(() => import('./pages/machines/MachineEditPage')) },
  { path: routes.simulator, Component: lazy(() => import('./pages/machines/MachineSimulatorPage')) },
  { path: routes.products, Component: lazy(() => import('./pages/products/ProductListPage')) },
  { path: routes.categories, Component: lazy(() => import('./pages/products/CategoryPage')) },
  { path: routes.inventory, Component: lazy(() => import('./pages/inventory/WarehousePage')) },
  { path: routes.restock, Component: lazy(() => import('./pages/inventory/RestockPage')) },
  { path: routes.stockHistory, Component: lazy(() => import('./pages/inventory/StockHistoryPage')) },
  { path: routes.cards, Component: lazy(() => import('./pages/cards/CardListPage')) },
  { path: routes.card, Component: lazy(() => import('./pages/cards/CardDetailPage')) },
  { path: routes.topUps, Component: lazy(() => import('./pages/cards/TopUpHistoryPage')) },
  { path: routes.customers, Component: lazy(() => import('./pages/customers/CustomerListPage')) },
  { path: routes.customer, Component: lazy(() => import('./pages/customers/CustomerDetailPage')) },
  { path: routes.transactions, Component: lazy(() => import('./pages/transactions/TransactionListPage')) },
  { path: routes.transaction, Component: lazy(() => import('./pages/transactions/TransactionDetailPage')) },
  { path: routes.alerts, Component: lazy(() => import('./pages/maintenance/AlertsPage')) },
  { path: routes.maintenance, Component: lazy(() => import('./pages/maintenance/MaintenancePage')) },
  { path: routes.reports, Component: lazy(() => import('./pages/reports/ReportsPage')) },
  { path: routes.settings, Component: lazy(() => import('./pages/settings/SettingsPage')) },
]
export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {pages.map(({ path, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense
                fallback={
                  <Spin size="large" description="Đang tải trang">
                    <div className="loading-space" />
                  </Spin>
                }
              >
                <Component />
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
