import { LinkButton } from '../../components/common/LinkButton'
import { Button, Drawer, Select, Tabs } from 'antd'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { StatusTag } from '../../components/common/StatusTag'
import { FilterSelect, SearchFilters } from '../../components/common/SearchFilters'
import { useAction } from '../../components/common/ConfirmDialog'
import { MachineOverview } from '../../components/machines/MachineOverview'
import { ShelfGrid, ShelfLegend } from '../../components/machines/ShelfGrid'
import { SlotForm } from '../../components/machines/SlotForm'
import { PaymentConfig } from '../../components/machines/PaymentConfig'
import { OrderTable } from '../../components/transactions/OrderTable'
import { StockMovementTable } from '../../components/inventory/StockMovementTable'
import { AlertTable } from '../../components/maintenance/AlertTable'
import { MaintenanceTable } from '../../components/maintenance/MaintenanceTable'
import { useAppStore } from '../../stores/useAppStore'
import { useFilters } from '../../hooks/useFilters'
import { machineStatus, options, slotStatus } from '../../static/status'
import type { MachineStatus } from '../../types/machine'
import NotFoundPage from '../NotFoundPage'
export default function MachineDetailPage() {
  const { id } = useParams()
  const db = useAppStore((s) => s.db)
  const machine = db.machines.find((m) => m.id === id)
  const f = useFilters()
  const [, setParams] = useSearchParams()
  const { confirm, report } = useAction()
  if (!machine) return <NotFoundPage />
  const slot = db.slots.find((s) => s.machineId === machine.id && s.id === f.get('slot'))
  const tab = f.get('tab') ?? 'overview'
  const changeTab = (next: string) =>
    setParams(
      (params) => {
        const query = new URLSearchParams(params)
        query.set('tab', next)
        query.delete('slot')
        return query
      },
      { replace: true },
    )
  const items = [
    { key: 'overview', label: 'Tổng quan', children: <MachineOverview machine={machine} /> },
    {
      key: 'shelves',
      label: 'Kệ sản phẩm',
      children: (
        <>
          <SearchFilters>
            <FilterSelect
              label="Trạng thái ô"
              value={f.get('stock')}
              onChange={(v) => f.set('stock', v)}
              options={options(slotStatus)}
            />
            <LinkButton to={'/inventory/restock?machine=' + machine.id}>Tiếp hàng</LinkButton>
          </SearchFilters>
          <ShelfLegend />
          <ShelfGrid machineId={machine.id} filter={f.get('stock')} onSlot={(s) => f.set('slot', s.id)} />
        </>
      ),
    },
    { key: 'payment', label: 'Thanh toán', children: <PaymentConfig key={machine.id} machine={machine} /> },
    {
      key: 'orders',
      label: 'Lịch sử mua hàng',
      children: <OrderTable rows={db.orders.filter((o) => o.machineId === machine.id)} />,
    },
    {
      key: 'restock',
      label: 'Lịch sử tiếp hàng',
      children: (
        <StockMovementTable
          rows={db.movements.filter(
            (m) => m.machineId === machine.id && ['RESTOCK', 'RETURN'].includes(m.type),
          )}
        />
      ),
    },
    {
      key: 'maintenance',
      label: 'Bảo trì & sự cố',
      children: (
        <div className="form-flow">
          <div className="panel-title">
            <h2>Phiếu bảo trì</h2>
            <Link to={'/maintenance?machine=' + machine.id}>Quản lý phiếu</Link>
          </div>
          <MaintenanceTable rows={db.maintenance.filter((t) => t.machineId === machine.id)} />
          <h2>Cảnh báo tại máy</h2>
          <AlertTable rows={db.alerts.filter((a) => a.machineId === machine.id)} />
        </div>
      ),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      children: (
        <div className="form-flow">
          <h2>Trạng thái vận hành mô phỏng</h2>
          <div className="inline-actions">
            <Select
              aria-label="Trạng thái kết nối"
              value={machine.status}
              options={options(machineStatus)}
              onChange={(status: MachineStatus) =>
                report(useAppStore.getState().setMachineStatus(machine.id, status))
              }
            />
            <Button
              danger={machine.active}
              onClick={() =>
                machine.active
                  ? confirm('Ngừng hoạt động máy', 'Máy sẽ ngừng bán. Lịch sử và tồn kho vẫn được lưu.', () =>
                      useAppStore.getState().setMachineActive(machine.id, false),
                    )
                  : report(useAppStore.getState().setMachineActive(machine.id, true))
              }
            >
              {machine.active ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
            </Button>
          </div>
        </div>
      ),
    },
  ]
  return (
    <>
      <PageHeader
        title={machine.name}
        description={machine.code + ' · ' + machine.location}
        actions={
          <>
            <StatusTag
              value={machine.active ? machine.status : 'INACTIVE'}
              labels={{ ...machineStatus, INACTIVE: 'Ngừng hoạt động' }}
            />
            <LinkButton to={'/machines/' + machine.id + '/edit'}>Sửa cấu hình</LinkButton>
            <LinkButton to={'/machines/' + machine.id + '/simulator'} type="primary">
              Mô phỏng mua hàng
            </LinkButton>
          </>
        }
      />
      <section className="panel panel-pad">
        <Tabs
          activeKey={items.some((item) => item.key === tab) ? tab : 'overview'}
          onChange={changeTab}
          items={items}
        />
      </section>
      {slot && tab === 'shelves' && (
        <Drawer
          title={'Ô ' + slot.code + (slot.retired ? ' · Đã lưu trữ' : '')}
          size={505}
          open
          onClose={() => f.set('slot')}
        >
          {slot.retired ? (
            <p>Ô đã ngừng sử dụng. Giao dịch và biến động kho vẫn được lưu.</p>
          ) : (
            <SlotForm key={slot.id} slot={slot} />
          )}
        </Drawer>
      )}
    </>
  )
}
