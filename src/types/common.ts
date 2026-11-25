import type { Machine, Shelf, Slot } from './machine'
import type { Product, Category } from './product'
import type { WarehouseStock, StockMovement } from './inventory'
import type { Customer, Wallet, Card, WalletEntry } from './wallet'
import type { Order, Refund, Payment, DispenseLog } from './transaction'
export interface Alert {
  id: string
  machineId: string
  slotId?: string
  type: 'OFFLINE' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'DISPENSE' | 'DEVICE'
  severity: 'WARNING' | 'ERROR'
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED'
  message: string
  createdAt: string
}
export interface MaintenanceTicket {
  id: string
  machineId: string
  description: string
  assignee: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
  updatedAt?: string
}
export interface Settings {
  displayName: string
  lowThreshold: number
}
export interface Db {
  schemaVersion: number
  settings: Settings
  machines: Machine[]
  shelves: Shelf[]
  slots: Slot[]
  products: Product[]
  categories: Category[]
  warehouse: WarehouseStock[]
  movements: StockMovement[]
  customers: Customer[]
  wallets: Wallet[]
  cards: Card[]
  ledger: WalletEntry[]
  orders: Order[]
  refunds: Refund[]
  payments: Payment[]
  dispenseLogs: DispenseLog[]
  alerts: Alert[]
  maintenance: MaintenanceTicket[]
}
export type Result<T> = { ok: true; data: T } | { ok: false; code: string; message: string }
