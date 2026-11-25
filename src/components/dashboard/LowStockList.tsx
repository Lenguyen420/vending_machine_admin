import { Link } from 'react-router-dom'
import { WarningOutlined } from '@ant-design/icons'
import type { Slot } from '../../types/machine'
import { useAppStore } from '../../stores/useAppStore'
import { EmptyState } from '../common/EmptyState'
export function LowStockList({ slots, location }: { slots: Slot[]; location?: string }) {
  const db = useAppStore((s) => s.db)
  return (
    <section className="panel panel-pad">
      <div className="panel-title">
        <h2>Cảnh báo tồn kho</h2>
        <Link
          to={
            '/alerts?' +
            new URLSearchParams({ group: 'stock', status: 'active', ...(location ? { location } : {}) })
          }
        >
          Xem tất cả
        </Link>
      </div>
      {slots.length ? (
        <ul className="clean-list">
          {slots.slice(0, 5).map((slot) => {
            const machine = db.machines.find((m) => m.id === slot.machineId)
            return (
              <li key={slot.id}>
                <div className="cell-media">
                  <span className={'stat-icon ' + (slot.quantity ? 'orange' : 'red')}>
                    <WarningOutlined />
                  </span>
                  <div>
                    <Link to={'/machines/' + slot.machineId + '?tab=shelves&slot=' + slot.id}>
                      <strong>{db.products.find((p) => p.id === slot.productId)?.name}</strong>
                    </Link>
                    <small>
                      {machine?.code} · Ô {slot.code}
                    </small>
                  </div>
                </div>
                <span className={'status-tag ' + (slot.quantity ? 'orange' : 'red')}>
                  {slot.quantity ? 'Còn ' + slot.quantity : 'Hết hàng'}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <EmptyState description="Các ô đang bán có đủ hàng" />
      )}
    </section>
  )
}
