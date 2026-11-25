import type { Db } from '../types/common'
import type { Order, PurchaseInput, Refund } from '../types/transaction'
import { find, requireRule } from '../utils/validation'
import { addAlert } from './alertService'
import { recordSale } from './inventoryService'
import type { Context } from './mockDb'
import { checkCard, recordWallet } from './walletService'
function refund(db: Db, ctx: Context, order: Order, reason: string) {
  const entry: Refund = {
    id: ctx.id(),
    orderId: order.id,
    amount: order.total,
    reason,
    createdAt: ctx.now,
    actor: ctx.actor,
  }
  if (order.cardId) {
    const card = find(db.cards, order.cardId, 'thẻ')
    recordWallet(db, ctx, find(db.wallets, card.walletId, 'ví'), {
      type: 'REFUND',
      amount: order.total,
      cardId: card.id,
      referenceId: entry.id,
      note: reason,
    })
  }
  db.refunds.unshift(entry)
  order.status = 'REFUNDED'
  order.paymentStatus = 'REFUNDED'
  return entry
}
export function refundOrder(db: Db, ctx: Context, orderId: string, reason: string) {
  const order = find(db.orders, orderId, 'đơn hàng')
  requireRule(
    order.status === 'SUCCESS' &&
      order.dispenseStatus === 'SUCCESS' &&
      !db.refunds.some((r) => r.orderId === orderId),
    'REFUND_INVALID',
    'Chỉ hoàn tiền đơn thành công chưa được hoàn.',
  )
  requireRule(reason.trim(), 'REASON', 'Nhập lý do hoàn tiền.')
  return refund(db, ctx, order, reason.trim())
}
export function simulatePurchase(db: Db, ctx: Context, input: PurchaseInput) {
  const existing = db.orders.find((order) => order.operationId === input.operationId)
  if (existing) return existing
  requireRule(
    input.operationId.trim() && ['SUCCESS', 'PAYMENT_FAILURE', 'DISPENSE_FAILURE'].includes(input.scenario),
    'OPERATION',
    'Kịch bản giao dịch không hợp lệ.',
  )
  const machine = find(db.machines, input.machineId, 'máy')
  requireRule(machine.active && machine.status === 'ONLINE', 'MACHINE_OFFLINE', 'Máy chưa sẵn sàng bán hàng.')
  requireRule(machine.methods.includes(input.method), 'METHOD_DISABLED', 'Phương thức thanh toán đã tắt.')
  requireRule(machine.reader === 'OK' || input.method === 'QR', 'READER_ERROR', 'Đầu đọc thẻ đang báo lỗi.')
  const slot = find(db.slots, input.slotId, 'ô hàng')
  requireRule(
    slot.machineId === machine.id && slot.active && slot.quantity > 0 && slot.productId,
    'SLOT_UNAVAILABLE',
    'Ô hàng chưa sẵn sàng hoặc đã hết hàng.',
  )
  const product = find(db.products, slot.productId, 'sản phẩm')
  requireRule(product.active, 'PRODUCT_INACTIVE', 'Sản phẩm đã ngừng bán.')
  const price = slot.priceOverride ?? product.price
  const internal =
    input.method === 'INTERNAL_CARD' ? checkCard(db, ctx, input.cardId, machine.id, price) : undefined
  const paid = input.scenario !== 'PAYMENT_FAILURE'
  const dispensed = paid && input.scenario === 'SUCCESS' && slot.motorStatus === 'OK'
  const order: Order = {
    id: ctx.id(),
    operationId: input.operationId,
    machineId: machine.id,
    machineName: machine.name,
    location: machine.location,
    slotId: slot.id,
    slotCode: slot.code,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    unitPrice: price,
    unitCost: product.cost,
    quantity: 1,
    total: price,
    cardId: internal?.card.id,
    customerId: internal?.wallet.customerId,
    method: input.method,
    status: dispensed ? 'SUCCESS' : 'FAILED',
    paymentStatus: paid ? 'PAID' : 'FAILED',
    dispenseStatus: paid ? (dispensed ? 'SUCCESS' : 'FAILED') : 'NOT_ATTEMPTED',
    createdAt: ctx.now,
  }
  db.orders.unshift(order)
  db.payments.unshift({
    id: ctx.id(),
    orderId: order.id,
    method: order.method,
    amount: price,
    status: paid ? 'SUCCESS' : 'FAILED',
    createdAt: ctx.now,
  })
  if (!paid) return order
  if (internal)
    recordWallet(db, ctx, internal.wallet, {
      type: 'PURCHASE',
      amount: -price,
      cardId: internal.card.id,
      referenceId: order.id,
    })
  db.dispenseLogs.unshift({
    id: ctx.id(),
    orderId: order.id,
    slotId: slot.id,
    status: dispensed ? 'SUCCESS' : 'FAILED',
    createdAt: ctx.now,
  })
  if (dispensed) recordSale(db, ctx, slot, product.id, order.id)
  else {
    refund(db, ctx, order, 'Hoàn tự động do lỗi xuất hàng mô phỏng')
    addAlert(db, ctx, {
      machineId: machine.id,
      slotId: slot.id,
      type: 'DISPENSE',
      severity: 'ERROR',
      message: 'Lỗi xuất hàng tại ô ' + slot.code + '. Giao dịch đã được hoàn tiền.',
    })
  }
  return order
}
