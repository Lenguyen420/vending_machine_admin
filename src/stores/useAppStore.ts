import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createSeed } from '../datas/seed'
import { SCHEMA_VERSION, STORAGE_KEY } from '../static/constants'
import type { Db, Settings } from '../types/common'
import type { MachineInput, MachineStatus, ShelfInput, SlotInput } from '../types/machine'
import type { Product, Category } from '../types/product'
import type { StockLine } from '../types/inventory'
import type { CardPolicy, Customer } from '../types/wallet'
import type { PurchaseInput } from '../types/transaction'
import { id } from '../utils/id'
import { find, requireRule, whole } from '../utils/validation'
import * as machines from '../services/machineService'
import * as products from '../services/productService'
import * as wallet from '../services/walletService'
import * as alerts from '../services/alertService'
import { stockOperation } from '../services/inventoryService'
import { refundOrder, simulatePurchase } from '../services/transactionService'
import { transact } from '../services/mockDb'
import type { Context } from '../services/mockDb'
function buildActions(read: () => Db, write: (db: Db) => void) {
  const run = <T>(fn: (db: Db, ctx: Context) => T) =>
    transact(
      read(),
      (db) => {
        const ctx = { now: new Date().toISOString(), actor: 'Admin', id }
        const data = fn(db, ctx)
        alerts.reconcileAlerts(db, ctx)
        return data
      },
      write,
    )
  return {
    createMachine: (input: MachineInput, shelves: ShelfInput[]) =>
      run((db, ctx) => machines.createMachine(db, ctx, input, shelves)),
    updateMachine: (machineId: string, input: MachineInput, shelves?: ShelfInput[]) =>
      run((db, ctx) => machines.updateMachine(db, ctx, machineId, input, shelves)),
    setMachineStatus: (machineId: string, status: MachineStatus) =>
      run((db, ctx) => machines.setMachineStatus(db, ctx, machineId, status)),
    setMachineActive: (machineId: string, active: boolean) =>
      run((db) => Object.assign(find(db.machines, machineId, 'máy'), { active })),
    updateSlot: (slotId: string, input: SlotInput) =>
      run((db, ctx) => machines.updateSlot(db, ctx, slotId, input)),
    assignProduct: (slotId: string, productId: string | null) =>
      run((db, ctx) => {
        const slot = find(db.slots, slotId, 'ô hàng')
        return machines.updateSlot(db, ctx, slotId, {
          ...slot,
          productId,
          priceOverride: productId === slot.productId ? slot.priceOverride : null,
        })
      }),
    createProduct: (input: Omit<Product, 'id'>) => run((db, ctx) => products.saveProduct(db, ctx, input)),
    updateProduct: (productId: string, input: Omit<Product, 'id'>) =>
      run((db, ctx) => products.saveProduct(db, ctx, input, productId)),
    deleteProduct: (productId: string) => run((db) => products.deleteProduct(db, productId)),
    saveCategory: (input: Omit<Category, 'id'>, categoryId?: string) =>
      run((db, ctx) => products.saveCategory(db, ctx, input, categoryId)),
    deleteCategory: (categoryId: string) => run((db) => products.deleteCategory(db, categoryId)),
    importStock: (lines: StockLine[], note: string) =>
      run((db, ctx) => stockOperation(db, ctx, 'IMPORT', lines, note)),
    restock: (lines: StockLine[], note: string) =>
      run((db, ctx) => stockOperation(db, ctx, 'RESTOCK', lines, note)),
    returnStock: (lines: StockLine[], note: string) =>
      run((db, ctx) => stockOperation(db, ctx, 'RETURN', lines, note)),
    adjustStock: (lines: StockLine[], note: string, waste = false) =>
      run((db, ctx) => stockOperation(db, ctx, waste ? 'WASTE' : 'ADJUST', lines, note)),
    createCustomer: (input: Omit<Customer, 'id'>) => run((db, ctx) => wallet.saveCustomer(db, ctx, input)),
    updateCustomer: (customerId: string, input: Omit<Customer, 'id'>) =>
      run((db, ctx) => wallet.saveCustomer(db, ctx, input, customerId)),
    issueCard: (customerId: string, code: string, policy: CardPolicy) =>
      run((db, ctx) => wallet.issueCard(db, ctx, customerId, code, policy)),
    lockCard: (cardId: string, lock: boolean) => run((db) => wallet.lockCard(db, cardId, lock)),
    replaceCard: (cardId: string, code: string) =>
      run((db, ctx) => wallet.replaceCard(db, ctx, cardId, code)),
    updateCardPolicy: (cardId: string, policy: CardPolicy) =>
      run((db) => {
        const card = find(db.cards, cardId, 'thẻ')
        requireRule(card.status !== 'REPLACED', 'CARD_REPLACED', 'Thẻ đã được cấp lại.')
        return wallet.applyCardPolicy(db, card, policy)
      }),
    topUp: (cardId: string, amount: number, method: string, note: string) =>
      run((db, ctx) => wallet.topUp(db, ctx, cardId, amount, method, note)),
    simulatePurchase: (input: PurchaseInput) => run((db, ctx) => simulatePurchase(db, ctx, input)),
    refundOrder: (orderId: string, reason: string) => run((db, ctx) => refundOrder(db, ctx, orderId, reason)),
    acknowledgeAlert: (alertId: string) => run((db) => alerts.changeAlert(db, alertId, 'ACKNOWLEDGED')),
    resolveAlert: (alertId: string) => run((db) => alerts.changeAlert(db, alertId, 'RESOLVED')),
    createMaintenance: (input: alerts.TicketInput) => run((db, ctx) => alerts.saveTicket(db, ctx, input)),
    updateMaintenance: (ticketId: string, input: alerts.TicketInput) =>
      run((db, ctx) => alerts.saveTicket(db, ctx, input, ticketId)),
    updateSettings: (input: Settings) =>
      run((db) => {
        requireRule(
          input.displayName.trim() && whole(input.lowThreshold),
          'SETTINGS',
          'Nhập tên và ngưỡng nguyên không âm.',
        )
        return Object.assign(db.settings, { ...input, displayName: input.displayName.trim() })
      }),
    resetDemo: () => {
      const db = createSeed()
      write(db)
      return { ok: true as const, data: db }
    },
  }
}
type Store = { db: Db } & ReturnType<typeof buildActions>
export function createAppStore() {
  let seed: Db | undefined
  let actions: ReturnType<typeof buildActions>
  let hydrated = false
  const initial = () => (seed ??= createSeed())
  const store = create<Store>()(
    persist(
      (set, get) => {
        actions = buildActions(
          () => get().db,
          (db) => set({ db }),
        )
        return {
          get db() {
            return initial()
          },
          ...actions,
        }
      },
      {
        name: STORAGE_KEY,
        version: SCHEMA_VERSION,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ db: state.db }),
        merge: (persisted) => {
          const db = (persisted as { db?: Db } | undefined)?.db
          hydrated = db?.schemaVersion === SCHEMA_VERSION
          return { ...actions, db: hydrated && db ? db : initial() }
        },
      },
    ),
  )
  if (!hydrated && store.persist) store.setState({ db: store.getState().db })
  return store
}
export const useAppStore = createAppStore()
