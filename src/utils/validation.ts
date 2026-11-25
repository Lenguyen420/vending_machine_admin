export class DomainError extends Error {
  readonly code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}
export function requireRule(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new DomainError(code, message)
}
export function find<T extends { id: string }>(rows: T[], id: string, label: string) {
  const row = rows.find((item) => item.id === id)
  requireRule(row, 'NOT_FOUND', 'Không tìm thấy ' + label + '.')
  return row
}
export const whole = (value: number, min = 0) => Number.isSafeInteger(value) && value >= min
export const key = (value: string) => value.trim().toLocaleLowerCase('vi')
