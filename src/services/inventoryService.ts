import type { Db } from '../types/common'
import type { StockLine, StockMovement } from '../types/inventory'
import type { Slot } from '../types/machine'
import { find, requireRule, whole } from '../utils/validation'
import type { Context } from './mockDb'
type StockType = Exclude<StockMovement['type'], 'SALE'>
export function warehouseQuantity(db: Db, productId: string) {
  return db.warehouse.find((item) => item.productId === productId)?.quantity ?? 0
}
export function stockOperation(db: Db, ctx: Context, type: StockType, lines: StockLine[], note: string) {
  requireRule(lines.length > 0, 'LINES', 'Thêm ít nhất một dòng hàng.')
  requireRule(!['WASTE', 'ADJUST'].includes(type) || note.trim(), 'REASON', 'Nhập lý do hủy hoặc điều chỉnh.')
  const referenceId = ctx.id()
  return lines.map((line) => {
    const slot = line.slotId ? find(db.slots, line.slotId, 'ô hàng') : undefined
    requireRule(!slot?.retired, 'SLOT_RETIRED', 'Ô hàng đã được lưu trữ.')
    requireRule(!['RESTOCK', 'RETURN'].includes(type) || slot, 'SLOT_REQUIRED', 'Chọn ô hàng.')
    requireRule(type !== 'IMPORT' || !slot, 'WAREHOUSE_ONLY', 'Nhập hàng vào kho tổng.')
    const productId = slot ? slot.productId : line.productId
    requireRule(productId, 'PRODUCT_REQUIRED', 'Chọn sản phẩm hoặc ô đã gán sản phẩm.')
    const product = find(db.products, productId, 'sản phẩm')
    if (type === 'RESTOCK')
      requireRule(
        product.active && !!slot && find(db.machines, slot.machineId, 'máy').active,
        'RESTOCK_INACTIVE',
        'Máy hoặc sản phẩm đã ngừng hoạt động.',
      )
    requireRule(
      type === 'ADJUST'
        ? Number.isSafeInteger(line.quantity) && line.quantity !== 0
        : whole(line.quantity, 1),
      'QUANTITY',
      'Số lượng phải là số nguyên hợp lệ.',
    )
    const warehouse = db.warehouse.find((item) => item.productId === productId)
    requireRule(warehouse, 'WAREHOUSE', 'Không tìm thấy tồn kho SKU.')
    const amount = line.quantity
    const transfer = type === 'RESTOCK' || type === 'RETURN'
    const recordWarehouse = transfer || !slot
    const warehouseBefore = warehouse.quantity
    const slotBefore = slot?.quantity
    if (type === 'RESTOCK') warehouse.quantity -= amount
    else if (type === 'RETURN' || type === 'IMPORT') warehouse.quantity += amount
    else if (!slot) warehouse.quantity += type === 'WASTE' ? -amount : amount
    if (slot) {
      slot.quantity += type === 'RETURN' || type === 'WASTE' ? -amount : amount
      requireRule(
        whole(slot.quantity) && slot.quantity <= slot.capacity,
        'SLOT_STOCK',
        'Số lượng vượt sức chứa hoặc tồn của ô ' + slot.code + '.',
      )
    }
    requireRule(
      whole(warehouse.quantity),
      'WAREHOUSE_STOCK',
      'Số lượng vượt tồn kho tổng của ' + product.sku + '.',
    )
    const movement: StockMovement = {
      id: ctx.id(),
      type,
      productId,
      machineId: slot?.machineId,
      slotId: slot?.id,
      quantity: amount,
      warehouseBefore: recordWarehouse ? warehouseBefore : undefined,
      warehouseAfter: recordWarehouse ? warehouse.quantity : undefined,
      slotBefore,
      slotAfter: slot?.quantity,
      referenceId,
      actor: ctx.actor,
      note: note.trim(),
      createdAt: ctx.now,
    }
    db.movements.unshift(movement)
    return movement
  })
}
export function recordSale(db: Db, ctx: Context, slot: Slot, productId: string, orderId: string) {
  const slotBefore = slot.quantity
  slot.quantity -= 1
  db.movements.unshift({
    id: ctx.id(),
    type: 'SALE',
    productId,
    machineId: slot.machineId,
    slotId: slot.id,
    quantity: 1,
    slotBefore,
    slotAfter: slot.quantity,
    referenceId: orderId,
    actor: ctx.actor,
    note: 'Bán hàng mô phỏng',
    createdAt: ctx.now,
  })
}
