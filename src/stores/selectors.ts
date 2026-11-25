import type { Db } from '../types/common'
import { stockStatus } from '../services/machineService'
export { filterOrders, revenue } from '../services/reportService'
export const machineSlots = (db: Db, machineId: string) =>
  db.slots.filter((s) => s.machineId === machineId && !s.retired)
export const machineFill = (db: Db, machineId: string) => {
  const slots = machineSlots(db, machineId)
  const capacity = slots.reduce((sum, s) => sum + s.capacity, 0)
  return capacity ? Math.round((slots.reduce((sum, s) => sum + s.quantity, 0) / capacity) * 100) : 0
}
export const productStock = (db: Db, productId: string, machineId?: string) =>
  db.slots
    .filter((s) => s.productId === productId && (!machineId || s.machineId === machineId))
    .reduce((sum, s) => sum + s.quantity, 0)
export function walletTotals(entries: Db['ledger']) {
  return entries.reduce(
    (s, e) => ({
      topUp: s.topUp + (e.type === 'TOP_UP' ? e.amount : 0),
      spend: s.spend + (e.type === 'TOP_UP' ? 0 : -e.amount),
    }),
    { topUp: 0, spend: 0 },
  )
}
export const cardWallet = (db: Db, cardId?: string) =>
  db.wallets.find((w) => w.id === db.cards.find((c) => c.id === cardId)?.walletId)
export const openAlerts = (db: Db, machineId?: string) =>
  db.alerts.filter((a) => a.status !== 'RESOLVED' && (!machineId || a.machineId === machineId))
export const flaggedSlots = (db: Db, machineIds?: Set<string>) =>
  db.slots.filter((s) => {
    if (machineIds && !machineIds.has(s.machineId)) return false
    const status = stockStatus(s, db.products.find((p) => p.id === s.productId)?.active)
    return status === 'empty' || status === 'low'
  })
export const nameOf = <T extends { id: string; name: string }>(rows: T[], id?: string) =>
  rows.find((r) => r.id === id)?.name ?? '—'
