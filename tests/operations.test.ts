import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '../src/stores/useAppStore'
import { createSeed } from '../src/datas/seed'
import { STORAGE_KEY } from '../src/static/constants'
import { warehouseQuantity } from '../src/services/inventoryService'
import { filterOrders, groupedSales, revenue, selectRefunds } from '../src/services/reportService'
import { csvContent } from '../src/utils/csv'
import { dayKey } from '../src/utils/date'
import type { Result } from '../src/types/common'
import type { ShelfInput } from '../src/types/machine'
import type { PurchaseInput } from '../src/types/transaction'

function data<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.code + ': ' + result.message)
  return result.data
}

let store: ReturnType<typeof createAppStore>
function state() {
  return store.getState()
}
function demo() {
  const { db } = state()
  const machine = db.machines.find((m) => m.code === 'VM001')!
  const slot = db.slots.find((s) => s.machineId === machine.id && s.code === 'A01')!
  const product = db.products.find((p) => p.id === slot.productId)!
  const card = db.cards.find((c) => c.code === 'CARD000028')!
  const wallet = db.wallets.find((w) => w.id === card.walletId)!
  return { machine, slot, product, card, wallet }
}
function purchase(overrides: Partial<PurchaseInput> = {}) {
  const { machine, slot, card } = demo()
  return state().simulatePurchase({
    machineId: machine.id,
    slotId: slot.id,
    cardId: card.id,
    method: 'INTERNAL_CARD',
    scenario: 'SUCCESS',
    operationId: 'test-operation',
    ...overrides,
  })
}
beforeEach(() => {
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  })
  store = createAppStore()
})

describe('Dữ liệu mẫu và cấu hình máy', () => {
  it('đối chiếu ví, kho, giao dịch và dữ liệu mẫu', () => {
    const db = createSeed('2026-11-25T03:20:00.000Z')
    expect(db.machines).toHaveLength(5)
    expect(db.products).toHaveLength(12)
    expect(db.customers).toHaveLength(10)
    expect(db.cards.length).toBeGreaterThanOrEqual(12)
    expect(db.orders.length).toBeGreaterThanOrEqual(60)
    expect(db.movements.length).toBeGreaterThanOrEqual(15)
    expect(db.ledger.filter((e) => e.type === 'TOP_UP').length).toBeGreaterThanOrEqual(20)
    expect(db.alerts.length).toBeGreaterThanOrEqual(5)
    expect(db.maintenance).toHaveLength(4)
    for (const wallet of db.wallets) {
      let balance = 0
      for (const entry of db.ledger.filter((e) => e.walletId === wallet.id).reverse()) {
        expect(entry.before).toBe(balance)
        balance += entry.amount
        expect(entry.after).toBe(balance)
      }
      expect(balance).toBe(wallet.balance)
    }
    for (const slot of db.slots) {
      let quantity = 0
      for (const m of db.movements.filter((m) => m.slotId === slot.id).reverse()) {
        expect(m.slotBefore).toBe(quantity)
        quantity = m.slotAfter!
      }
      expect(quantity).toBe(slot.quantity)
    }
    for (const stock of db.warehouse) {
      let quantity = 0
      for (const m of db.movements
        .filter((m) => m.productId === stock.productId && m.warehouseBefore !== undefined)
        .reverse()) {
        expect(m.warehouseBefore).toBe(quantity)
        quantity = m.warehouseAfter!
      }
      expect(quantity).toBe(stock.quantity)
    }
    for (const order of db.orders) {
      expect(db.payments.filter((p) => p.orderId === order.id)).toHaveLength(1)
      expect(db.dispenseLogs.filter((p) => p.orderId === order.id)).toHaveLength(
        order.dispenseStatus === 'NOT_ATTEMPTED' ? 0 : 1,
      )
      expect(db.refunds.filter((p) => p.orderId === order.id)).toHaveLength(
        order.status === 'REFUNDED' ? 1 : 0,
      )
    }
    expect(demo().wallet.balance).toBe(150000)
    expect(demo().slot.quantity).toBe(8)
  })
  it('tạo máy 3 × 4 đúng mã ô và chặn trùng mã hoặc serial', () => {
    const input = { ...demo().machine, name: 'Máy kiểm thử', code: 'VM100', serial: 'TEST-100' }
    const shelves: ShelfInput[] = Array.from({ length: 3 }, () => ({
      slots: Array.from({ length: 4 }, () => ({ capacity: 9, productId: null })),
    }))
    const machine = data(state().createMachine(input, shelves))
    expect(
      state()
        .db.slots.filter((s) => s.machineId === machine.id)
        .map((s) => [s.code, s.quantity]),
    ).toEqual(
      ['A01', 'A02', 'A03', 'A04', 'B01', 'B02', 'B03', 'B04', 'C01', 'C02', 'C03', 'C04'].map((code) => [
        code,
        0,
      ]),
    )
    const before = state().db
    expect(state().createMachine({ ...input, code: 'vm100', serial: 'OTHER' }, shelves)).toMatchObject({
      ok: false,
      code: 'DUPLICATE',
    })
    expect(state().createMachine({ ...input, code: 'VM101' }, shelves)).toMatchObject({
      ok: false,
      code: 'DUPLICATE',
    })
    expect(state().db).toBe(before)
  })
  it('giữ số tồn và liên kết lịch sử khi đổi bố trí', () => {
    const { machine, slot } = demo()
    const shelves = state()
      .db.shelves.filter((s) => s.machineId === machine.id)
      .map((s) => ({
        slots: state()
          .db.slots.filter((item) => item.shelfId === s.id)
          .map(({ capacity, productId }) => ({ capacity, productId })),
      }))
    expect(state().updateMachine(machine.id, machine, shelves.slice(0, 1))).toMatchObject({
      ok: false,
      code: 'SLOT_HAS_STOCK',
    })
    expect(demo().slot.quantity).toBe(8)
    data(state().returnStock([{ slotId: slot.id, quantity: 8 }], 'Trả đủ'))
    const first = shelves[0].slots
    data(
      state().updateMachine(machine.id, machine, [
        { slots: [...first.slice(0, 3), { ...first[3], capacity: 12 }] },
        ...shelves.slice(1),
      ]),
    )
    expect(state().db.slots.find((s) => s.id === slot.id)).toBeDefined()
    expect(state().updateSlot(slot.id, { ...demo().slot, capacity: 1, lowThreshold: 2 })).toMatchObject({
      ok: false,
      code: 'THRESHOLD',
    })
    const historic = state().db.slots.find((s) => s.machineId === machine.id && s.code === 'A04')!
    data(
      state().returnStock([{ slotId: historic.id, quantity: historic.quantity }], 'Thu hồi trước khi bỏ ô'),
    )
    data(state().updateMachine(machine.id, machine, [{ slots: first.slice(0, 3) }, ...shelves.slice(1)]))
    expect(state().db.slots.find((s) => s.id === historic.id)).toMatchObject({ active: false, retired: true })
    expect(state().db.movements.some((m) => m.slotId === historic.id)).toBe(true)
  })
})
describe('Ví, thanh toán và hoàn tiền', () => {
  it('nạp 50.000 vào ví dùng chung mà doanh thu giữ nguyên', () => {
    const { card, wallet } = demo()
    const initialRevenue = revenue(state().db.orders)
    const row = data(state().topUp(card.id, 50000, 'Tiền mặt', 'Kiểm thử'))
    expect(row).toMatchObject({ before: 150000, after: 200000, amount: 50000, type: 'TOP_UP' })
    expect(demo().wallet.balance).toBe(200000)
    expect(state().db.cards.filter((c) => c.walletId === wallet.id)).toHaveLength(2)
    expect(revenue(state().db.orders)).toBe(initialRevenue)
    expect(state().topUp(card.id, 1.2, 'Tiền mặt', '')).toMatchObject({ ok: false })
  })
  it('mua Coca, chốt giá và hoàn một lần, không tăng tồn', () => {
    const before = state().db
    const { product } = demo()
    const order = data(purchase())
    expect(order).toMatchObject({
      status: 'SUCCESS',
      unitPrice: 12000,
      total: 12000,
      productName: 'Coca Cola 330ml',
    })
    expect(demo().wallet.balance).toBe(138000)
    expect(demo().slot.quantity).toBe(7)
    expect(state().db.orders).toHaveLength(before.orders.length + 1)
    expect(state().db.movements).toHaveLength(before.movements.length + 1)
    expect(state().db.movements[0]).toMatchObject({
      type: 'SALE',
      slotBefore: 8,
      slotAfter: 7,
      referenceId: order.id,
    })
    expect(revenue(state().db.orders)).toBe(revenue(before.orders) + 12000)
    data(state().updateProduct(product.id, { ...product, name: 'Tên mới', price: 13000 }))
    expect(state().db.orders[0]).toMatchObject({ unitPrice: 12000, productName: 'Coca Cola 330ml' })
    expect(state().refundOrder(order.id, ' ')).toMatchObject({ ok: false, code: 'REASON' })
    data(state().refundOrder(order.id, 'Khách yêu cầu'))
    const after = state().db
    expect(state().refundOrder(order.id, 'Lặp')).toMatchObject({ ok: false, code: 'REFUND_INVALID' })
    expect(state().db).toBe(after)
    expect(demo().wallet.balance).toBe(150000)
    expect(demo().slot.quantity).toBe(7)
    expect(revenue(state().db.orders)).toBe(revenue(before.orders))
  })
  it('dùng một operationId cho đúng một đơn và bán qua ngân hàng không động vào ví', () => {
    const before = state().db
    const order = data(purchase({ method: 'BANK_CARD' }))
    expect(data(purchase({ method: 'BANK_CARD' })).id).toBe(order.id)
    expect(demo().wallet.balance).toBe(150000)
    expect(demo().slot.quantity).toBe(7)
    expect(state().db.orders).toHaveLength(before.orders.length + 1)
    expect(state().db.payments).toHaveLength(before.payments.length + 1)
  })
  it('chặn offline, tắt phương thức, khóa thẻ, vượt phạm vi, hạn mức và thiếu tiền', () => {
    const { machine, card, slot } = demo()
    const blocked = (code: string, overrides: Partial<PurchaseInput> = {}) => {
      const before = state().db
      expect(purchase(overrides)).toMatchObject({ ok: false, code })
      expect(state().db).toBe(before)
    }
    data(state().setMachineStatus(machine.id, 'OFFLINE'))
    blocked('MACHINE_OFFLINE')
    data(state().setMachineStatus(machine.id, 'ONLINE'))
    blocked('METHOD_DISABLED', { method: 'QR' })
    data(state().lockCard(card.id, true))
    blocked('CARD_INACTIVE')
    data(state().lockCard(card.id, false))
    data(
      state().updateCardPolicy(card.id, { dailyLimit: null, allowedMachineIds: [state().db.machines[1].id] }),
    )
    blocked('CARD_SCOPE')
    data(state().updateCardPolicy(card.id, { dailyLimit: 11000, allowedMachineIds: [] }))
    blocked('DAILY_LIMIT')
    data(state().updateCardPolicy(card.id, { dailyLimit: null, allowedMachineIds: [] }))
    data(state().updateSlot(slot.id, { ...slot, priceOverride: 151000 }))
    blocked('BALANCE')
  })
  it('áp dụng hạn mức chi ròng theo từng thẻ và giữ ví khi cấp lại', () => {
    const { card, wallet } = demo()
    data(state().updateCardPolicy(card.id, { dailyLimit: 12000, allowedMachineIds: [] }))
    const first = data(purchase())
    expect(purchase({ operationId: 'op-2' })).toMatchObject({ ok: false, code: 'DAILY_LIMIT' })
    data(state().refundOrder(first.id, 'Kiểm thử'))
    data(purchase({ operationId: 'op-3' }))
    const replacement = data(state().replaceCard(card.id, 'CARD000099'))
    expect(replacement).toMatchObject({ walletId: wallet.id, dailyLimit: 12000, status: 'ACTIVE' })
    expect(state().db.cards.find((c) => c.id === card.id)?.status).toBe('REPLACED')
    expect(state().db.wallets.find((w) => w.id === wallet.id)?.balance).toBe(138000)
  })
  it('giữ tồn/ví khi thanh toán thất bại và tự hoàn khi lỗi xuất hàng', () => {
    const before = state().db
    const failed = data(purchase({ scenario: 'PAYMENT_FAILURE' }))
    expect(failed).toMatchObject({
      status: 'FAILED',
      paymentStatus: 'FAILED',
      dispenseStatus: 'NOT_ATTEMPTED',
    })
    expect(state().db.ledger).toHaveLength(before.ledger.length)
    const failure = data(purchase({ operationId: 'dispense-failure', scenario: 'DISPENSE_FAILURE' }))
    expect(failure).toMatchObject({ status: 'REFUNDED', paymentStatus: 'REFUNDED', dispenseStatus: 'FAILED' })
    expect(state().db.payments.find((p) => p.orderId === failure.id)).toMatchObject({ status: 'SUCCESS' })
    expect(state().db.refunds.find((r) => r.orderId === failure.id)).toMatchObject({ amount: 12000 })
    expect(
      state()
        .db.ledger.slice(0, 2)
        .map((e) => e.amount),
    ).toEqual([12000, -12000])
    expect(state().db.alerts[0]).toMatchObject({ type: 'DISPENSE', status: 'OPEN' })
    expect(demo().slot.quantity).toBe(8)
    expect(demo().wallet.balance).toBe(150000)
    expect(state().db.movements).toHaveLength(before.movements.length)
  })
})

describe('Kho, cảnh báo, báo cáo và lưu dữ liệu', () => {
  it('tiếp 2 sản phẩm và ghi nhật ký; tiếp vượt sức chứa rollback tất cả', () => {
    const { machine, slot, product } = demo()
    const second = state().db.slots.find((s) => s.machineId === machine.id && s.code === 'A02')!
    const warehouse = warehouseQuantity(state().db, product.id)
    const before = state().db
    expect(
      state().restock(
        [
          { slotId: slot.id, quantity: 2 },
          { slotId: second.id, quantity: 99 },
        ],
        '',
      ),
    ).toMatchObject({ ok: false, code: 'SLOT_STOCK' })
    expect(state().db).toBe(before)
    const [movement] = data(state().restock([{ slotId: slot.id, quantity: 2 }], ''))
    expect(demo().slot.quantity).toBe(10)
    expect(movement).toMatchObject({
      slotBefore: 8,
      slotAfter: 10,
      warehouseBefore: warehouse,
      warehouseAfter: warehouse - 2,
    })
  })
  it('kiểm tra tổng SKU qua nhiều dòng rồi rollback nguyên phiếu', () => {
    const { machine, slot, product } = demo()
    const other = state().db.slots.find((s) => s.machineId === machine.id && s.code === 'C04')!
    data(state().assignProduct(other.id, product.id))
    const stock = warehouseQuantity(state().db, product.id)
    data(state().adjustStock([{ productId: product.id, quantity: 2 - stock }], 'Kiểm kê'))
    const before = state().db
    expect(
      state().restock(
        [
          { slotId: slot.id, quantity: 2 },
          { slotId: other.id, quantity: 1 },
        ],
        '',
      ),
    ).toMatchObject({ ok: false, code: 'WAREHOUSE_STOCK' })
    expect(state().db).toBe(before)
  })
  it('đóng cảnh báo tồn và offline khi khắc phục', () => {
    const { machine } = demo()
    const low = state().db.slots.find((s) => s.machineId === machine.id && s.code === 'A03')!
    const alert = state().db.alerts.find((a) => a.slotId === low.id && a.status === 'OPEN')!
    data(state().acknowledgeAlert(alert.id))
    data(state().restock([{ slotId: low.id, quantity: 1 }], 'Bổ sung'))
    expect(state().db.alerts.find((a) => a.id === alert.id)?.status).toBe('RESOLVED')
    const offline = state().db.alerts.find((a) => a.type === 'OFFLINE' && a.status === 'OPEN')!
    data(state().setMachineStatus(offline.machineId, 'ONLINE'))
    expect(state().db.alerts.find((a) => a.id === offline.id)?.status).toBe('RESOLVED')
    expect(
      state().db.alerts.some(
        (a) => a.slotId === state().db.slots.find((s) => s.machineId === machine.id && s.code === 'C04')?.id,
      ),
    ).toBe(false)
  })
  it('lọc theo ngày bán và theo ngày hoàn; xuất CSV BOM an toàn', () => {
    const o = data(purchase())
    data(state().refundOrder(o.id, 'Hoàn tiền thử'))
    const order = state().db.orders.find((item) => item.id === o.id)!
    expect(groupedSales([order], (item) => item.sku)).toMatchObject([
      { net: 0, gross: 12000, refunded: 12000 },
    ])
    const day = dayKey(order.createdAt)
    const filter = { from: day, to: day, machineId: o.machineId, productId: o.productId }
    expect(filterOrders(state().db.orders, filter).some((item) => item.id === o.id)).toBe(true)
    const nextDay = new Date(Date.parse(order.createdAt) + 86400000).toISOString()
    const laterDb = {
      ...state().db,
      refunds: state().db.refunds.map((r) => (r.orderId === o.id ? { ...r, createdAt: nextDay } : r)),
    }
    expect(selectRefunds(laterDb, filter).some((r) => r.orderId === o.id)).toBe(false)
    expect(
      selectRefunds(laterDb, { ...filter, from: dayKey(nextDay), to: dayKey(nextDay) }).some(
        (r) => r.orderId === o.id,
      ),
    ).toBe(true)
    const csv = csvContent([
      ['Mã', 'Số tiền'],
      ['Hàng, "đặc biệt"', -12000],
      [' =SUM(1,2)', 3],
    ])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain('"Hàng, ""đặc biệt"""')
    expect(csv).toContain('"\' =SUM(1,2)"')
    expect(csv).toContain('"-12000"')
  })
  it('lưu seed ngay, khôi phục dữ liệu khi tải lại và reset về mẫu', () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
    const { card } = demo()
    data(state().topUp(card.id, 50000, 'Tiền mặt', ''))
    const reloaded = createAppStore()
    expect(reloaded.getState().db).toEqual(state().db)
    data(reloaded.getState().resetDemo())
    expect(
      createAppStore()
        .getState()
        .db.wallets.find((w) => w.id === demo().wallet.id)?.balance,
    ).toBe(150000)
  })
})
