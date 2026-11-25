export type MachineStatus = 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
export type PaymentMethod = 'INTERNAL_CARD' | 'BANK_CARD' | 'QR'
export interface Machine {
  id: string
  code: string
  name: string
  location: string
  model: string
  serial: string
  status: MachineStatus
  methods: PaymentMethod[]
  lastSeenAt: string
  manager: string
  active: boolean
  terminal: string
  reader: 'OK' | 'ERROR'
}
export interface Shelf {
  id: string
  machineId: string
  label: string
  position: number
}
export interface Slot {
  id: string
  machineId: string
  shelfId: string
  code: string
  productId: string | null
  capacity: number
  quantity: number
  lowThreshold: number
  priceOverride: number | null
  active: boolean
  motorStatus: 'OK' | 'ERROR'
  retired?: boolean
}
export type MachineInput = Pick<
  Machine,
  'code' | 'name' | 'location' | 'model' | 'serial' | 'manager' | 'methods' | 'terminal' | 'reader'
>
export interface ShelfInput {
  slots: { capacity: number; productId: string | null }[]
}
export type SlotInput = Pick<
  Slot,
  'capacity' | 'productId' | 'lowThreshold' | 'priceOverride' | 'active' | 'motorStatus'
>
