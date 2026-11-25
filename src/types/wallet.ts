export interface Customer {
  id: string
  code: string
  name: string
  group: string
  active: boolean
}
export interface Wallet {
  id: string
  customerId: string
  balance: number
}
export interface Card {
  id: string
  code: string
  walletId: string
  status: 'ACTIVE' | 'LOCKED' | 'REPLACED'
  dailyLimit: number | null
  allowedMachineIds: string[]
}
export interface WalletEntry {
  id: string
  walletId: string
  cardId?: string
  type: 'TOP_UP' | 'PURCHASE' | 'REFUND'
  amount: number
  before: number
  after: number
  referenceId: string
  method?: string
  note?: string
  actor: string
  createdAt: string
}
export type CardPolicy = Pick<Card, 'dailyLimit' | 'allowedMachineIds'>
