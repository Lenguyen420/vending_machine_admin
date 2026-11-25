import type { WalletEntry } from '../../types/wallet'
import { walletTotals } from '../../stores/selectors'
import { MoneyText } from '../common/MoneyText'
export function WalletSummary({ balance, entries }: { balance: number; entries: WalletEntry[] }) {
  const { topUp, spend } = walletTotals(entries)
  return (
    <dl className="detail-list">
      <div>
        <dt>Số dư ví</dt>
        <dd>
          <MoneyText value={balance} />
        </dd>
      </div>
      <div>
        <dt>Tổng nạp</dt>
        <dd>
          <MoneyText value={topUp} />
        </dd>
      </div>
      <div>
        <dt>Tổng chi ròng</dt>
        <dd>
          <MoneyText value={spend} />
        </dd>
      </div>
    </dl>
  )
}
