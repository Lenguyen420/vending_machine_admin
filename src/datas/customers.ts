import { customerGroups } from '../static/constants'
export const customerSeeds = [
  'Nguyễn Văn A',
  'Trần Minh B',
  'Lê Thanh C',
  'Phạm Thu D',
  'Hoàng Gia E',
  'Vũ Ngọc F',
  'Đặng Minh G',
  'Bùi Anh H',
  'Đỗ Linh I',
  'Ngô Tú K',
].map((name, index) => ({
  name,
  code: 'KH' + String(index + 1).padStart(3, '0'),
  group: customerGroups[index % 3],
  active: true,
}))
