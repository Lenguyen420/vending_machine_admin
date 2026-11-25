import { AppstoreOutlined } from '@ant-design/icons'
import type { CSSProperties } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { stockStatus } from '../../services/machineService'
import type { Slot } from '../../types/machine'
import { slotStatus } from '../../static/status'
import { StatusTag } from '../common/StatusTag'
import { EmptyState } from '../common/EmptyState'
import { SlotCard } from './SlotCard'
export function ShelfLegend() {
  return (
    <div className="legend">
      {Object.keys(slotStatus).map((value) => (
        <StatusTag key={value} value={value} labels={slotStatus} />
      ))}
    </div>
  )
}
export function ShelfGrid({
  machineId,
  filter,
  onSlot,
  selected,
  shop = false,
}: {
  machineId: string
  filter?: string
  onSlot: (slot: Slot) => void
  selected?: string
  shop?: boolean
}) {
  const db = useAppStore((s) => s.db)
  const shelves = db.shelves.filter((s) => s.machineId === machineId).sort((a, b) => a.position - b.position)
  const rows = shelves
    .map((s) => ({
      ...s,
      slots: db.slots
        .filter((slot) => {
          const product = db.products.find((p) => p.id === slot.productId)
          return (
            slot.shelfId === s.id &&
            !slot.retired &&
            (!filter || stockStatus(slot, product?.active) === filter)
          )
        })
        .sort((a, b) => a.code.localeCompare(b.code)),
    }))
    .filter((s) => s.slots.length)
  if (!rows.length) return <EmptyState description="Không có ô phù hợp" />
  return (
    <div className="shelf-face">
      <div className="shelf-face-heading">
        <AppstoreOutlined /> Mặt trước máy bán hàng
      </div>
      {rows.map((s) => (
        <section className="shelf-row" key={s.id}>
          <h3 className="shelf-label">Tầng {s.label}</h3>
          <div className="shelf-slots" style={{ '--slots': s.slots.length } as CSSProperties}>
            {s.slots.map((slot) => {
              const product = db.products.find((p) => p.id === slot.productId)
              return (
                <SlotCard
                  key={slot.id}
                  slot={slot}
                  product={product}
                  onClick={() => onSlot(slot)}
                  selected={shop ? selected === slot.id : undefined}
                  disabled={shop && (!slot.active || !slot.quantity || !product?.active)}
                />
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
