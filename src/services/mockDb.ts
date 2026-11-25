import type { Db, Result } from '../types/common'
import { DomainError } from '../utils/validation'
export interface Context {
  now: string
  actor: string
  id: () => string
}
export function transact<T>(db: Db, action: (draft: Db) => T, commit: (next: Db) => void): Result<T> {
  const draft = structuredClone(db)
  try {
    const data = action(draft)
    commit(draft)
    return { ok: true, data }
  } catch (error) {
    if (error instanceof DomainError) return { ok: false, code: error.code, message: error.message }
    throw error
  }
}
