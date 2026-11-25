import type { Db } from '../types/common'
import type { Product, Category } from '../types/product'
import type { Context } from './mockDb'
import { find, key, requireRule, whole } from '../utils/validation'
import { productImages } from '../static/constants'
export function saveProduct(db: Db, ctx: Context, values: Omit<Product, 'id'>, productId?: string) {
  requireRule(
    [values.sku, values.name, values.unit, values.barcode].every((field) => field.trim()),
    'REQUIRED',
    'Điền đầy đủ thông tin sản phẩm.',
  )
  requireRule(whole(values.cost) && whole(values.price), 'PRICE', 'Giá phải là số nguyên không âm.')
  requireRule(
    !db.products.some((p) => p.id !== productId && key(p.sku) === key(values.sku)),
    'DUPLICATE',
    'SKU đã tồn tại.',
  )
  const category = find(db.categories, values.categoryId, 'danh mục')
  requireRule(
    category.active || (productId && find(db.products, productId, 'sản phẩm').categoryId === category.id),
    'CATEGORY_INACTIVE',
    'Danh mục đã ngừng hoạt động.',
  )
  requireRule(productImages.includes(values.image), 'IMAGE', 'Chọn ảnh sản phẩm có sẵn.')
  const input = {
    ...values,
    sku: values.sku.trim(),
    barcode: values.barcode.trim(),
    name: values.name.trim(),
    unit: values.unit.trim(),
  }
  if (productId) return Object.assign(find(db.products, productId, 'sản phẩm'), input)
  const product = { ...input, id: ctx.id() }
  db.products.push(product)
  db.warehouse.push({ productId: product.id, quantity: 0 })
  return product
}
export function deleteProduct(db: Db, productId: string) {
  const product = find(db.products, productId, 'sản phẩm')
  requireRule(
    !db.slots.some((s) => s.productId === productId) &&
      !db.movements.some((m) => m.productId === productId) &&
      !db.orders.some((o) => o.productId === productId) &&
      !db.warehouse.some((s) => s.productId === productId && s.quantity > 0),
    'PRODUCT_REFERENCED',
    'Sản phẩm có tồn hoặc lịch sử. Hãy chuyển sang ngừng bán.',
  )
  db.products = db.products.filter((p) => p.id !== productId)
  db.warehouse = db.warehouse.filter((s) => s.productId !== productId)
  return product
}
export function saveCategory(db: Db, ctx: Context, input: Omit<Category, 'id'>, categoryId?: string) {
  requireRule(input.name.trim(), 'REQUIRED', 'Nhập tên danh mục.')
  requireRule(
    !db.categories.some((c) => c.id !== categoryId && key(c.name) === key(input.name)),
    'DUPLICATE',
    'Danh mục đã tồn tại.',
  )
  const values = { ...input, name: input.name.trim() }
  if (categoryId) return Object.assign(find(db.categories, categoryId, 'danh mục'), values)
  const category = { ...values, id: ctx.id() }
  db.categories.push(category)
  return category
}
export function deleteCategory(db: Db, categoryId: string) {
  const category = find(db.categories, categoryId, 'danh mục')
  requireRule(
    !db.products.some((p) => p.categoryId === categoryId),
    'CATEGORY_REFERENCED',
    'Danh mục đang có sản phẩm. Hãy chuyển sang ngừng hoạt động.',
  )
  db.categories = db.categories.filter((c) => c.id !== categoryId)
  return category
}
