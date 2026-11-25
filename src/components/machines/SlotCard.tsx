import type { Slot } from '../../types/machine'
import type { Product } from '../../types/product'
import { stockStatus } from '../../services/machineService'
import { slotStatus } from '../../static/status'
import { ProductImage } from '../common/ProductImage'
import { StatusTag } from '../common/StatusTag'
import { MoneyText } from '../common/MoneyText'
export function SlotCard({
  slot,
  product,
  onClick,
  selected,
  disabled,
}: {
  slot: Slot
  product?: Product
  onClick: () => void
  selected?: boolean
  disabled?: boolean
}) {
  const status = stockStatus(slot, product?.active)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={'slot-card ' + status + (selected ? ' selected' : '')}
    >
      <div className="slot-card-top">
        <strong>{slot.code}</strong>
        <StatusTag value={status} labels={slotStatus} />
      </div>
      {product ? <ProductImage image={product.image} /> : <div className="product-thumb" />}
      <div className="product-name">{product?.name ?? 'Ô trống'}</div>
      {product ? <MoneyText value={slot.priceOverride ?? product.price} /> : <span className="muted">—</span>}
      <div className="slot-count">
        <span>Tồn</span>
        <strong>
          {slot.quantity}/{slot.capacity}
        </strong>
      </div>
      <progress aria-label={'Tồn kho ô ' + slot.code} value={slot.quantity} max={slot.capacity} />
    </button>
  )
}
