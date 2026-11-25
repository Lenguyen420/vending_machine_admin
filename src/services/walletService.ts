import type { Db } from '../types/common'
import type { Card, CardPolicy, Customer, Wallet, WalletEntry } from '../types/wallet'
import { customerGroups, topUpMethods } from '../static/constants'
import { dayKey } from '../utils/date'
import { find, key, requireRule, whole } from '../utils/validation'
import type { Context } from './mockDb'
export function saveCustomer(db: Db, ctx: Context, input: Omit<Customer, 'id'>, customerId?: string) {
  requireRule(
    input.code.trim() && input.name.trim() && customerGroups.includes(input.group),
    'REQUIRED',
    'Nhập mã, họ tên và nhóm khách hàng.',
  )
  requireRule(
    !db.customers.some((c) => c.id !== customerId && key(c.code) === key(input.code)),
    'DUPLICATE',
    'Mã khách hàng đã tồn tại.',
  )
  const values = { ...input, code: input.code.trim(), name: input.name.trim() }
  if (customerId) return Object.assign(find(db.customers, customerId, 'khách hàng'), values)
  const customer = { ...values, id: ctx.id() }
  db.customers.push(customer)
  db.wallets.push({ id: ctx.id(), customerId: customer.id, balance: 0 })
  return customer
}
export function applyCardPolicy(db: Db, card: Card, input: CardPolicy) {
  requireRule(
    input.dailyLimit === null || whole(input.dailyLimit),
    'LIMIT',
    'Hạn mức phải là số nguyên không âm.',
  )
  input.allowedMachineIds.forEach((machineId) => find(db.machines, machineId, 'máy'))
  return Object.assign(card, {
    dailyLimit: input.dailyLimit,
    allowedMachineIds: [...new Set(input.allowedMachineIds)],
  })
}
export function issueCard(db: Db, ctx: Context, customerId: string, code: string, policy: CardPolicy) {
  const customer = find(db.customers, customerId, 'khách hàng')
  requireRule(customer.active, 'CUSTOMER_INACTIVE', 'Khách hàng đã ngừng hoạt động.')
  requireRule(
    code.trim() && !db.cards.some((c) => key(c.code) === key(code)),
    'CARD_CODE',
    'Mã thẻ trống hoặc đã tồn tại.',
  )
  const wallet = db.wallets.find((w) => w.customerId === customerId)
  requireRule(wallet, 'WALLET', 'Không tìm thấy ví của khách hàng.')
  const card: Card = {
    id: ctx.id(),
    code: code.trim(),
    walletId: wallet.id,
    status: 'ACTIVE',
    dailyLimit: null,
    allowedMachineIds: [],
  }
  applyCardPolicy(db, card, policy)
  db.cards.push(card)
  return card
}
export function lockCard(db: Db, cardId: string, lock: boolean) {
  const card = find(db.cards, cardId, 'thẻ')
  requireRule(card.status !== 'REPLACED', 'CARD_REPLACED', 'Thẻ đã được cấp lại.')
  card.status = lock ? 'LOCKED' : 'ACTIVE'
  return card
}
export function replaceCard(db: Db, ctx: Context, cardId: string, code: string) {
  const card = find(db.cards, cardId, 'thẻ')
  requireRule(card.status !== 'REPLACED', 'CARD_REPLACED', 'Thẻ đã được cấp lại.')
  const replacement = issueCard(db, ctx, find(db.wallets, card.walletId, 'ví').customerId, code, card)
  card.status = 'REPLACED'
  return replacement
}
export function recordWallet(
  db: Db,
  ctx: Context,
  wallet: Wallet,
  entry: Pick<WalletEntry, 'type' | 'amount' | 'referenceId' | 'cardId' | 'method' | 'note'>,
) {
  const before = wallet.balance
  const after = before + entry.amount
  requireRule(whole(after), 'BALANCE', 'Số dư ví không đủ hoặc vượt giới hạn lưu trữ.')
  wallet.balance = after
  const row: WalletEntry = {
    ...entry,
    id: ctx.id(),
    before,
    after,
    actor: ctx.actor,
    createdAt: ctx.now,
    walletId: wallet.id,
  }
  db.ledger.unshift(row)
  return row
}
export function topUp(db: Db, ctx: Context, cardId: string, amount: number, method: string, note: string) {
  const card = find(db.cards, cardId, 'thẻ')
  const wallet = find(db.wallets, card.walletId, 'ví')
  requireRule(
    card.status === 'ACTIVE' && find(db.customers, wallet.customerId, 'khách hàng').active,
    'CARD_INACTIVE',
    'Thẻ hoặc chủ thẻ không hoạt động.',
  )
  requireRule(
    whole(amount, 1) && topUpMethods.includes(method),
    'TOP_UP',
    'Nhập số tiền nguyên dương và chọn phương thức.',
  )
  return recordWallet(db, ctx, wallet, {
    type: 'TOP_UP',
    amount,
    referenceId: ctx.id(),
    method,
    note: note.trim(),
    cardId,
  })
}
export function checkCard(
  db: Db,
  ctx: Context,
  cardId: string | undefined,
  machineId: string,
  amount: number,
) {
  requireRule(cardId, 'CARD_REQUIRED', 'Chọn thẻ nội bộ.')
  const card = find(db.cards, cardId, 'thẻ')
  const wallet = find(db.wallets, card.walletId, 'ví')
  requireRule(
    card.status === 'ACTIVE' && find(db.customers, wallet.customerId, 'khách hàng').active,
    'CARD_INACTIVE',
    'Thẻ hoặc chủ thẻ không hoạt động.',
  )
  requireRule(
    !card.allowedMachineIds.length || card.allowedMachineIds.includes(machineId),
    'CARD_SCOPE',
    'Thẻ chưa được phép sử dụng ở máy này.',
  )
  requireRule(wallet.balance >= amount, 'BALANCE', 'Ví không đủ số dư.')
  const day = dayKey(ctx.now)
  const netSpend = db.orders
    .filter(
      (o) =>
        o.cardId === card.id &&
        o.dispenseStatus === 'SUCCESS' &&
        o.paymentStatus === 'PAID' &&
        dayKey(o.createdAt) === day,
    )
    .reduce((sum, o) => sum + o.total, 0)
  requireRule(
    card.dailyLimit === null || netSpend + amount <= card.dailyLimit,
    'DAILY_LIMIT',
    'Giao dịch vượt hạn mức ngày của thẻ.',
  )
  return { card, wallet }
}
