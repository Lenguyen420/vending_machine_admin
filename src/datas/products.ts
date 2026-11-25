import type { Category, Product } from '../types/product'
export const categories: Category[] = [
  { id: 'drinks', name: 'Đồ uống', active: true },
  { id: 'snacks', name: 'Bánh & đồ ăn nhẹ', active: true },
  { id: 'food', name: 'Đồ ăn đóng gói', active: true },
]
const items = [
  ['Coca Cola 330ml', 'drinks', 8000, 12000, 'cola', 'Lon'],
  ['Pepsi 330ml', 'drinks', 8000, 12000, 'blue', 'Lon'],
  ['Sting 330ml', 'drinks', 6500, 10000, 'sting', 'Lon'],
  ['Aquafina 500ml', 'drinks', 4000, 7000, 'water', 'Chai'],
  ['Oreo', 'snacks', 10000, 15000, 'cookies', 'Gói'],
  ['Oishi tôm cay', 'snacks', 5000, 8000, 'snack', 'Gói'],
  ['Lay’s', 'snacks', 10000, 15000, 'chips', 'Gói'],
  ['Poca', 'snacks', 6500, 10000, 'snack', 'Gói'],
  ['Chocopie', 'snacks', 8000, 12000, 'cookies', 'Gói'],
  ['Bánh mì đóng gói', 'food', 10000, 15000, 'bread', 'Gói'],
  ['Milo 180ml', 'drinks', 8000, 12000, 'milk', 'Hộp'],
  ['Sữa tươi', 'drinks', 8000, 11000, 'water', 'Hộp'],
] as const
export const products: Product[] = items.map(([name, categoryId, cost, price, image, unit], index) => {
  const suffix = String(index + 1).padStart(3, '0')
  return {
    id: 'product-' + suffix,
    sku: 'SP' + suffix,
    barcode: '8930000010' + suffix,
    name,
    categoryId,
    cost,
    price,
    image,
    unit,
    active: true,
  }
})
