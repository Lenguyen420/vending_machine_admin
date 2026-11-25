import { Button, Form } from 'antd'
import type { Order } from '../../types/transaction'
import { useAppStore } from '../../stores/useAppStore'
import { FormModal, TextField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
import { money } from '../../utils/currency'
export function RefundModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const refund = useAppStore((s) => s.refundOrder)
  const { report } = useAction()
  return (
    <FormModal title="Hoàn tiền toàn phần" onClose={onClose}>
      <p className="flow-note">
        Khoản hoàn {money(order.total)} được ghi vào lịch sử giao dịch. Tồn kho giữ nguyên vì khách đã nhận
        hàng.
      </p>
      <Form
        layout="vertical"
        onFinish={(v) => {
          if (report(refund(order.id, v.reason), 'Đã hoàn tiền toàn phần')) onClose()
        }}
      >
        <TextField name="reason" label="Lý do hoàn tiền" area />
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button danger type="primary" htmlType="submit">
            Xác nhận hoàn tiền
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
