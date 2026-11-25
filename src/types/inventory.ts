export interface WarehouseStock {
  productId: string
  quantity: number
}
export interface StockMovement {
  id: string
  type: 'IMPORT' | 'RESTOCK' | 'SALE' | 'RETURN' | 'WASTE' | 'ADJUST'
  productId: string
  machineId?: string
  slotId?: string
  quantity: number
  warehouseBefore?: number
  warehouseAfter?: number
  slotBefore?: number
  slotAfter?: number
  referenceId?: string
  actor: string
  note: string
  createdAt: string
}
export interface StockLine {
  productId?: string
  slotId?: string
  quantity: number
}
