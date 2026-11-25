import { SCHEMA_VERSION } from '../static/constants'
import { addAlert, reconcileAlerts, saveTicket } from '../services/alertService'
import { createMachine, setMachineStatus } from '../services/machineService'
import { stockOperation } from '../services/inventoryService'
import { issueCard, lockCard, replaceCard, saveCustomer, topUp } from '../services/walletService'
import { refundOrder, simulatePurchase } from '../services/transactionService'
import type { Db } from '../types/common'
import type { Context } from '../services/mockDb'
import { daysAgo } from '../utils/date'
import { machineSeeds } from './machines'
import { categories, products } from './products'
import { customerSeeds } from './customers'
import { featuredCard, seedTopUps } from './cards'
import { warehouseSeeds, firstMachineQuantity, firstMachineCapacity } from './inventory'
import { dailySales } from './orders'
import { ticketSeeds } from './alerts'
export function createSeed(now = new Date().toISOString()): Db {
  let counter = 0
  const ctx: Context = { now, actor: 'Admin demo', id: () => 'DEMO-' + String(++counter).padStart(5, '0') }
  const at = (ago: number) =>
    new Date(Math.min(Date.parse(daysAgo(ago, now) + 'T09:30:00+07:00'), Date.parse(now))).toISOString()
  ctx.now = at(29)
  const db: Db = {
    schemaVersion: SCHEMA_VERSION,
    settings: { displayName: 'Vending Admin', lowThreshold: 2 },
    machines: [],
    shelves: [],
    slots: [],
    products: structuredClone(products),
    categories: structuredClone(categories),
    warehouse: products.map((p) => ({ productId: p.id, quantity: 0 })),
    movements: [],
    customers: [],
    wallets: [],
    cards: [],
    ledger: [],
    orders: [],
    refunds: [],
    payments: [],
    dispenseLogs: [],
    alerts: [],
    maintenance: [],
  }
  const machines = machineSeeds.map(({ input, rows, columns }, m) =>
    createMachine(
      db,
      ctx,
      input,
      Array.from({ length: rows }, (_, r) => ({
        slots: Array.from({ length: columns }, (_, c) => {
          const position = r * columns + c
          return {
            capacity: m === 0 ? firstMachineCapacity[position] : 10,
            productId: m === 0 && position === 11 ? null : products[(position + m * 3) % products.length].id,
          }
        }),
      })),
    ),
  )
  const targets = db.slots
    .map((slot, i) => ({
      slotId: slot.id,
      productId: slot.productId ?? undefined,
      quantity: i < 12 ? firstMachineQuantity[i] : 3 + ((i * 3) % 7),
    }))
    .filter((line) => line.productId && line.quantity)
  stockOperation(
    db,
    ctx,
    'IMPORT',
    products.map((p, i) => ({
      productId: p.id,
      quantity:
        warehouseSeeds[i] +
        targets.filter((t) => t.productId === p.id).reduce((sum, t) => sum + t.quantity, 0),
    })),
    'Tồn đầu kỳ',
  )
  stockOperation(db, ctx, 'RESTOCK', targets, 'Thiết lập tồn đầu kỳ')
  const customers = customerSeeds.map((c) => saveCustomer(db, ctx, c))
  const unlimited = { dailyLimit: null, allowedMachineIds: [] }
  const cards = customers.map((c, i) =>
    issueCard(db, ctx, c.id, i === 0 ? featuredCard : 'CARD' + String(28 + i).padStart(6, '0'), unlimited),
  )
  issueCard(db, ctx, customers[0].id, 'CARD000038', unlimited)
  replaceCard(db, ctx, cards[8].id, 'CARD000039')
  lockCard(db, cards[9].id, true)
  cards.forEach((card, i) => {
    const topUpCard = i === 8 ? db.cards.find((c) => c.code === 'CARD000039')! : card
    if (i === 9) lockCard(db, card.id, false)
    const amount = seedTopUps[i]
    topUp(db, ctx, topUpCard.id, amount - 20000, 'Chuyển khoản', 'Số dư đầu kỳ')
    topUp(db, ctx, topUpCard.id, 20000, 'Tiền mặt', 'Nạp tại quầy')
    if (i === 9) lockCard(db, card.id, true)
  })
  const salesMachines = [machines[1], machines[4], machines[2], machines[3], machines[0]]
  let saleCount = 0
  dailySales.forEach((count, i) => {
    ctx.now = at(29 - i)
    for (let j = 0; j < count; j++) {
      const index = saleCount++
      const machine = salesMachines[i >= 27 ? index % 2 : index % salesMachines.length]
      const choices = db.slots.filter((s) => s.machineId === machine.id && s.quantity > 0 && s.productId)
      const slot = choices[(index * 7 + Math.floor(index / 5)) % choices.length]
      const method = machine.methods[Math.floor(index / 4) % machine.methods.length]
      const scenario =
        index % 17 === 0 ? 'PAYMENT_FAILURE' : index % 19 === 0 ? 'DISPENSE_FAILURE' : 'SUCCESS'
      const card = cards[1 + (index % 5)]
      if (method === 'INTERNAL_CARD' && db.wallets.find((w) => w.id === card.walletId)!.balance < 15000)
        topUp(db, ctx, card.id, 50000, 'Tiền mặt', 'Nạp bổ sung')
      const order = simulatePurchase(db, ctx, {
        operationId: 'seed-order-' + index,
        machineId: machine.id,
        slotId: slot.id,
        method,
        scenario,
        cardId: card.id,
      })
      if (order.dispenseStatus === 'SUCCESS') {
        stockOperation(
          db,
          ctx,
          'IMPORT',
          [{ productId: order.productId, quantity: 1 }],
          'Bổ sung hàng từ kho nhập',
        )
        stockOperation(db, ctx, 'RESTOCK', [{ slotId: slot.id, quantity: 1 }], 'Bổ sung sau bán')
        if (index % 13 === 0) refundOrder(db, ctx, order.id, 'Hoàn tiền theo yêu cầu mẫu')
      }
    }
  })
  ctx.now = now
  machines.forEach((m, i) => setMachineStatus(db, ctx, m.id, machineSeeds[i].status))
  machines[2].lastSeenAt = at(1)
  addAlert(db, ctx, {
    machineId: machines[3].id,
    type: 'DEVICE',
    severity: 'WARNING',
    message: 'Đến hạn bảo dưỡng đầu đọc và bộ xuất hàng.',
  })
  ticketSeeds.forEach((ticket, i) =>
    saveTicket(db, ctx, { ...ticket, machineId: machines[[2, 3, 0, 4][i]].id }),
  )
  reconcileAlerts(db, ctx)
  return db
}
