import type { PaymentMethod, MachineStatus } from '../types/machine'
export const machineStatus: Record<MachineStatus, string> = {
  ONLINE: 'Trực tuyến',
  OFFLINE: 'Ngoại tuyến',
  MAINTENANCE: 'Bảo trì',
}
export const methods: Record<PaymentMethod, string> = {
  INTERNAL_CARD: 'Thẻ nội bộ',
  BANK_CARD: 'Thẻ ngân hàng',
  QR: 'Mã QR',
}
export const orderStatus = { SUCCESS: 'Thành công', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền' }
export const paymentStatus = { PAID: 'Đã thanh toán', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền' }
export const dispenseStatus = {
  SUCCESS: 'Đã xuất hàng',
  FAILED: 'Lỗi xuất hàng',
  NOT_ATTEMPTED: 'Chưa xuất hàng',
}
export const activeLabels = { ACTIVE: 'Hoạt động', INACTIVE: 'Ngừng hoạt động' }
export const cardStatus = { ACTIVE: 'Hoạt động', LOCKED: 'Đã khóa', REPLACED: 'Đã thay thế' }
export const stockTypes = {
  RESTOCK: 'Tiếp hàng vào máy',
  IMPORT: 'Nhập kho tổng',
  RETURN: 'Thu hồi về kho',
  WASTE: 'Hủy hàng',
  ADJUST: 'Điều chỉnh tồn',
}
export type StockType = keyof typeof stockTypes
export const movementTypes = {
  IMPORT: 'Nhập kho',
  RESTOCK: 'Tiếp hàng',
  SALE: 'Bán hàng',
  RETURN: 'Thu hồi',
  WASTE: 'Hủy hàng',
  ADJUST: 'Điều chỉnh',
}
export const alertTypes = {
  OFFLINE: 'Mất kết nối',
  LOW_STOCK: 'Sắp hết hàng',
  OUT_OF_STOCK: 'Hết hàng',
  DISPENSE: 'Lỗi xuất hàng',
  DEVICE: 'Thiết bị',
}
export const alertStatus = { OPEN: 'Chưa xử lý', ACKNOWLEDGED: 'Đã đọc', RESOLVED: 'Đã xử lý' }
export const ticketStatus = { OPEN: 'Mới mở', IN_PROGRESS: 'Đang xử lý', DONE: 'Hoàn tất' }
export const priorityLabels = { LOW: 'Thấp', MEDIUM: 'Vừa', HIGH: 'Cao' }
export const slotStatus = {
  available: 'Còn hàng',
  low: 'Sắp hết',
  empty: 'Hết hàng',
  inactive: 'Ngừng bán',
  unassigned: 'Chưa gán',
}
export const walletTypes = { TOP_UP: 'Nạp tiền', PURCHASE: 'Mua hàng', REFUND: 'Hoàn tiền' }
export const options = <T extends string>(labels: Record<T, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value: value as T, label: String(label) }))
