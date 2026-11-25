import type { PaymentMethod } from './machine'
export interface Order {
  id: string
  operationId: string
  machineId: string
  machineName: string
  location: string
  slotId: string
  slotCode: string
  productId: string
  productName: string
  sku: string
  unitPrice: number
  unitCost: number
  quantity: number
  total: number
  cardId?: string
  customerId?: string
  method: PaymentMethod
  status: 'SUCCESS' | 'FAILED' | 'REFUNDED'
  paymentStatus: 'PAID' | 'FAILED' | 'REFUNDED'
  dispenseStatus: 'SUCCESS' | 'FAILED' | 'NOT_ATTEMPTED'
  createdAt: string
}
export interface Refund {
  id: string
  orderId: string
  amount: number
  reason: string
  createdAt: string
  actor: string
}
export interface Payment {
  id: string
  orderId: string
  method: PaymentMethod
  amount: number
  status: 'SUCCESS' | 'FAILED'
  createdAt: string
}
export interface DispenseLog {
  id: string
  orderId: string
  slotId: string
  status: 'SUCCESS' | 'FAILED'
  createdAt: string
}
export interface PurchaseInput {
  operationId: string
  machineId: string
  slotId: string
  cardId?: string
  method: PaymentMethod
  scenario: 'SUCCESS' | 'PAYMENT_FAILURE' | 'DISPENSE_FAILURE'
}
