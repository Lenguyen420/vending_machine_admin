const format = new Intl.NumberFormat('vi-VN')
export const money = (value: number) => format.format(value) + ' ₫'
export const number = (value: number) => format.format(value)
