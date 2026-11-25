import type { Db } from '../types/common'
import type {
  Machine,
  MachineInput,
  MachineStatus,
  Shelf,
  ShelfInput,
  Slot,
  SlotInput,
} from '../types/machine'
import { methods } from '../static/status'
import { find, key, requireRule, whole } from '../utils/validation'
import { addAlert } from './alertService'
import type { Context } from './mockDb'

export const slotCode = (label: string, index: number) => label + String(index + 1).padStart(2, '0')
export const shelfLabel = (index: number) => String.fromCharCode(65 + index)
export function stockStatus(slot: Slot, productActive = true) {
  if (!slot.active || !productActive) return 'inactive'
  if (!slot.productId) return 'unassigned'
  if (!slot.quantity) return 'empty'
  return slot.quantity <= slot.lowThreshold ? 'low' : 'available'
}
function validateMachine(db: Db, input: MachineInput, machineId?: string) {
  const { code, name, location, model, serial, manager, terminal, reader } = input
  const fields = {
    code: code.trim(),
    name: name.trim(),
    location: location.trim(),
    model: model.trim(),
    serial: serial.trim(),
    manager: manager.trim(),
  }
  requireRule(Object.values(fields).every(Boolean), 'REQUIRED', 'Điền đầy đủ thông tin máy.')
  requireRule(
    !db.machines.some(
      (m) => m.id !== machineId && (key(m.code) === key(code) || key(m.serial) === key(serial)),
    ),
    'DUPLICATE',
    'Mã máy hoặc số serial đã tồn tại.',
  )
  requireRule(
    input.methods.every((method) => Object.hasOwn(methods, method)),
    'PAYMENT_METHOD',
    'Phương thức thanh toán không hợp lệ.',
  )
  requireRule(reader === 'OK' || reader === 'ERROR', 'READER_STATUS', 'Trạng thái đầu đọc không hợp lệ.')
  return { ...fields, terminal: terminal.trim(), reader, methods: [...new Set(input.methods)] }
}
function configureShelves(db: Db, ctx: Context, machineId: string, inputs: ShelfInput[]) {
  requireRule(
    inputs.length >= 1 &&
      inputs.length <= 10 &&
      inputs.every((s) => s.slots.length >= 1 && s.slots.length <= 12),
    'SHELF_SIZE',
    'Máy có từ 1–10 tầng, mỗi tầng có từ 1–12 ô.',
  )
  const previous = db.slots.filter((s) => s.machineId === machineId)
  const kept = new Set<string>()
  inputs.forEach((input, i) => {
    const label = shelfLabel(i)
    let shelf = db.shelves.find((item) => item.machineId === machineId && item.position === i)
    if (!shelf) {
      const created: Shelf = { id: ctx.id(), machineId, label, position: i }
      db.shelves.push(created)
      shelf = created
    }
    const shelfId = shelf.id
    input.slots.forEach((values, j) => {
      const code = slotCode(label, j)
      let slot = previous.find((item) => item.code === code && !item.retired)
      if (!slot) {
        slot = {
          id: ctx.id(),
          machineId,
          shelfId,
          code,
          productId: null,
          capacity: values.capacity,
          quantity: 0,
          lowThreshold: Math.min(db.settings.lowThreshold, values.capacity),
          priceOverride: null,
          active: true,
          motorStatus: 'OK',
        }
        db.slots.push(slot)
      }
      const priceOverride = values.productId === slot.productId ? slot.priceOverride : null
      const lowThreshold = Math.min(slot.lowThreshold, values.capacity)
      updateSlot(db, ctx, slot.id, { ...slot, ...values, priceOverride, lowThreshold })
      kept.add(slot.id)
    })
  })
  for (const slot of previous) {
    if (kept.has(slot.id) || slot.retired) continue
    requireRule(slot.quantity === 0, 'SLOT_HAS_STOCK', 'Thu hồi hàng ở ô ' + slot.code + ' trước khi bỏ ô.')
    const hasHistory =
      db.orders.some((o) => o.slotId === slot.id) ||
      db.movements.some((m) => m.slotId === slot.id) ||
      db.alerts.some((a) => a.slotId === slot.id)
    if (hasHistory) Object.assign(slot, { retired: true, active: false })
    else db.slots = db.slots.filter((s) => s.id !== slot.id)
  }
  db.shelves = db.shelves.filter(
    (s) => s.machineId !== machineId || db.slots.some((slot) => slot.shelfId === s.id),
  )
}
export function createMachine(
  db: Db,
  ctx: Context,
  input: MachineInput,
  shelves: ShelfInput[],
  status: MachineStatus = 'ONLINE',
) {
  const machine: Machine = {
    ...validateMachine(db, input),
    id: ctx.id(),
    status,
    active: true,
    lastSeenAt: ctx.now,
  }
  db.machines.push(machine)
  configureShelves(db, ctx, machine.id, shelves)
  return machine
}
export function updateMachine(
  db: Db,
  ctx: Context,
  machineId: string,
  input: MachineInput,
  shelves?: ShelfInput[],
) {
  const machine = find(db.machines, machineId, 'máy')
  const values = validateMachine(db, input, machineId)
  if (shelves) configureShelves(db, ctx, machineId, shelves)
  if (machine.reader !== 'ERROR' && values.reader === 'ERROR')
    addAlert(db, ctx, {
      machineId,
      type: 'DEVICE',
      severity: 'ERROR',
      message: 'Đầu đọc thanh toán báo lỗi mô phỏng.',
    })
  return Object.assign(machine, values)
}
export function updateSlot(db: Db, ctx: Context, slotId: string, input: SlotInput) {
  const slot = find(db.slots, slotId, 'ô hàng')
  requireRule(!slot.retired, 'SLOT_RETIRED', 'Ô hàng đã được lưu trữ.')
  requireRule(
    whole(input.capacity, 1) && input.capacity >= slot.quantity,
    'CAPACITY',
    'Sức chứa phải là số nguyên dương và không thấp hơn tồn.',
  )
  requireRule(
    whole(input.lowThreshold) && input.lowThreshold <= input.capacity,
    'THRESHOLD',
    'Ngưỡng cảnh báo phải từ 0 đến sức chứa.',
  )
  requireRule(
    input.priceOverride === null || whole(input.priceOverride),
    'PRICE',
    'Giá bán phải là số nguyên không âm.',
  )
  if (input.productId !== slot.productId) {
    requireRule(slot.quantity === 0, 'SLOT_HAS_STOCK', 'Cần thu hồi hàng trước khi đổi sản phẩm.')
    if (input.productId)
      requireRule(
        find(db.products, input.productId, 'sản phẩm').active,
        'PRODUCT_INACTIVE',
        'Sản phẩm đã ngừng bán.',
      )
  }
  if (slot.motorStatus !== 'ERROR' && input.motorStatus === 'ERROR')
    addAlert(db, ctx, {
      machineId: slot.machineId,
      slotId,
      type: 'DEVICE',
      severity: 'ERROR',
      message: 'Động cơ mô phỏng ở ô ' + slot.code + ' báo lỗi.',
    })
  const { capacity, productId, lowThreshold, priceOverride, active, motorStatus } = input
  return Object.assign(slot, { capacity, productId, lowThreshold, priceOverride, active, motorStatus })
}
export function setMachineStatus(db: Db, ctx: Context, machineId: string, status: MachineStatus) {
  requireRule(['ONLINE', 'OFFLINE', 'MAINTENANCE'].includes(status), 'STATUS', 'Trạng thái máy không hợp lệ.')
  const machine = find(db.machines, machineId, 'máy')
  machine.status = status
  if (status === 'ONLINE') machine.lastSeenAt = ctx.now
  return machine
}
