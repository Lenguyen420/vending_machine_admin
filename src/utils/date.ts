import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)
const zone = 'Asia/Ho_Chi_Minh'
export const dayKey = (value = new Date().toISOString()) => dayjs(value).tz(zone).format('YYYY-MM-DD')
export const dateTime = (value?: string) => (value ? dayjs(value).tz(zone).format('DD/MM/YYYY HH:mm') : '—')
export const daysAgo = (days: number, value = new Date().toISOString()) =>
  dayjs(value).tz(zone).subtract(days, 'day').format('YYYY-MM-DD')
export const shortDate = (day: string) => dayjs(day).format('DD/MM')
