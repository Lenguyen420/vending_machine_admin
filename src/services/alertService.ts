import type { Alert, Db, MaintenanceTicket } from '../types/common'
import { find, requireRule } from '../utils/validation'
import type { Context } from './mockDb'
export function addAlert(
  db: Db,
  ctx: Context,
  entry: Pick<Alert, 'machineId' | 'slotId' | 'type' | 'severity' | 'message'>,
) {
  const alert: Alert = { ...entry, id: ctx.id(), createdAt: ctx.now, status: 'OPEN' }
  db.alerts.unshift(alert)
  return alert
}
const automatic = ['OFFLINE', 'LOW_STOCK', 'OUT_OF_STOCK']
export function reconcileAlerts(db: Db, ctx: Context) {
  const desired: Pick<Alert, 'machineId' | 'slotId' | 'type' | 'severity' | 'message'>[] = []
  const activeMachines = new Set(db.machines.filter((m) => m.active).map((m) => m.id))
  for (const machine of db.machines) {
    if (machine.active && machine.status === 'OFFLINE')
      desired.push({
        machineId: machine.id,
        type: 'OFFLINE',
        severity: 'ERROR',
        message: machine.name + ' đang ngoại tuyến.',
      })
  }
  for (const slot of db.slots) {
    if (
      !slot.active ||
      !activeMachines.has(slot.machineId) ||
      !slot.productId ||
      slot.quantity > slot.lowThreshold ||
      !db.products.find((p) => p.id === slot.productId)?.active
    )
      continue
    const empty = slot.quantity === 0
    desired.push({
      machineId: slot.machineId,
      slotId: slot.id,
      type: empty ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      severity: empty ? 'ERROR' : 'WARNING',
      message: 'Ô ' + slot.code + (empty ? ' đã hết hàng.' : ' còn ' + slot.quantity + ' sản phẩm.'),
    })
  }
  const matches = (a: (typeof desired)[number], b: Alert) =>
    a.machineId === b.machineId && a.slotId === b.slotId && a.type === b.type
  db.alerts.forEach((alert) => {
    if (
      alert.status !== 'RESOLVED' &&
      automatic.includes(alert.type) &&
      !desired.some((item) => matches(item, alert))
    )
      alert.status = 'RESOLVED'
  })
  desired.forEach((entry) => {
    const active = db.alerts.find((item) => item.status !== 'RESOLVED' && matches(entry, item))
    if (active) active.message = entry.message
    else addAlert(db, ctx, entry)
  })
}
export function changeAlert(db: Db, alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') {
  const alert = find(db.alerts, alertId, 'cảnh báo')
  requireRule(alert.status !== 'RESOLVED', 'ALERT_CLOSED', 'Cảnh báo đã được xử lý.')
  requireRule(
    status !== 'RESOLVED' || !automatic.includes(alert.type),
    'AUTO_ALERT',
    'Cảnh báo tự đóng khi điều kiện được khắc phục.',
  )
  alert.status = status
  return alert
}
export type TicketInput = Pick<
  MaintenanceTicket,
  'machineId' | 'description' | 'assignee' | 'priority' | 'status'
>
export function saveTicket(db: Db, ctx: Context, input: TicketInput, ticketId?: string) {
  find(db.machines, input.machineId, 'máy')
  requireRule(input.description.trim() && input.assignee.trim(), 'REQUIRED', 'Nhập mô tả và kỹ thuật viên.')
  const values = {
    ...input,
    description: input.description.trim(),
    assignee: input.assignee.trim(),
    updatedAt: ctx.now,
  }
  if (ticketId) return Object.assign(find(db.maintenance, ticketId, 'phiếu bảo trì'), values)
  const ticket = { ...values, id: ctx.id(), createdAt: ctx.now }
  db.maintenance.unshift(ticket)
  return ticket
}
