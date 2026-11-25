export interface Product {
  id: string
  sku: string
  barcode: string
  name: string
  categoryId: string
  image: string
  cost: number
  price: number
  unit: string
  active: boolean
}
export interface Category {
  id: string
  name: string
  active: boolean
}
