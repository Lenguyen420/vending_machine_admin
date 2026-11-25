import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { RestockForm } from '../../components/inventory/RestockForm'
import { stockTypes } from '../../static/status'
import type { StockType } from '../../static/status'
export default function RestockPage() {
  const [params] = useSearchParams()
  const type = params.get('type') ?? ''
  return (
    <>
      <PageHeader
        title="Thao tác tồn kho"
        description="Lập phiếu nhập, tiếp hàng, thu hồi hoặc điều chỉnh."
      />
      <RestockForm
        key={params.toString()}
        initialType={Object.hasOwn(stockTypes, type) ? (type as StockType) : 'RESTOCK'}
        initialMachine={params.get('machine') ?? undefined}
        initialSlot={params.get('slot') ?? undefined}
        initialProduct={params.get('product') ?? undefined}
      />
    </>
  )
}
