import { PageHeader } from '../../components/common/PageHeader'
import { MachineWizard } from '../../components/machines/MachineWizard'
export default function MachineCreatePage() {
  return (
    <>
      <PageHeader
        title="Thêm máy bán hàng"
        description="Khai báo điểm đặt máy, bố trí kệ và phương thức thanh toán."
      />
      <MachineWizard />
    </>
  )
}
