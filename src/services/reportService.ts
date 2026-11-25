import type { Db } from '../types/common'
import type { Order } from '../types/transaction'
import { dayKey } from '../utils/date'
export interface Period {
  from?: string
  to?: string
}
export interface OrderFilter extends Period {
  machineId?: string
  location?: string
  method?: string
  status?: string
  productId?: string
}
export function inPeriod(timestamp: string, filter: Period) {
  const day = dayKey(timestamp)
  return (!filter.from || day >= filter.from) && (!filter.to || day <= filter.to)
}
export function filterOrders(orders: Order[], filter: OrderFilter) {
  return orders.filter(
    (o) =>
      inPeriod(o.createdAt, filter) &&
      (!filter.machineId || filter.machineId === o.machineId) &&
      (!filter.location || filter.location === o.location) &&
      (!filter.method || filter.method === o.method) &&
      (!filter.status || filter.status === o.status) &&
      (!filter.productId || filter.productId === o.productId),
  )
}
export const sold = (o: Order) => o.dispenseStatus === 'SUCCESS'
export function revenue(orders: Order[]) {
  return orders.filter((o) => sold(o) && o.status === 'SUCCESS').reduce((total, o) => total + o.total, 0)
}
export function groupedSales(orders: Order[], group: (o: Order) => string) {
  const groups = new Map<
    string,
    { name: string; gross: number; refunded: number; net: number; quantity: number }
  >()
  for (const order of orders.filter(sold)) {
    const name = group(order)
    const row = groups.get(name) ?? { name, gross: 0, refunded: 0, net: 0, quantity: 0 }
    row.gross += order.total
    if (order.status === 'REFUNDED') row.refunded += order.total
    row.net = row.gross - row.refunded
    row.quantity += order.quantity
    groups.set(name, row)
  }
  return [...groups.values()]
}
export function selectRefunds(db: Db, filter: OrderFilter) {
  const orderIds = new Set(
    filterOrders(db.orders, { ...filter, from: undefined, to: undefined }).map((o) => o.id),
  )
  return db.refunds.filter((r) => orderIds.has(r.orderId) && inPeriod(r.createdAt, filter))
}
