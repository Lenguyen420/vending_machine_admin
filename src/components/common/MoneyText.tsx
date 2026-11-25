import { money } from '../../utils/currency'
export function MoneyText({ value }: { value: number }) {
  return <span className="money">{money(value)}</span>
}
