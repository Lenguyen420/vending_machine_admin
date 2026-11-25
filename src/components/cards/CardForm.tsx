import { Button, Form } from 'antd'
import { FormModal, SelectField, TextField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
import { CardPolicyFields } from './CardPolicyForm'
import { useAppStore } from '../../stores/useAppStore'
import type { Card, CardPolicy } from '../../types/wallet'
export function CardForm({
  onClose,
  customerId,
  replacing,
  onSaved,
}: {
  onClose: () => void
  customerId?: string
  replacing?: Card
  onSaved?: (card: Card) => void
}) {
  const customers = useAppStore((s) => s.db.customers)
  const { report } = useAction()
  return (
    <FormModal title={replacing ? 'Cấp lại thẻ' : 'Phát hành thẻ'} onClose={onClose}>
      <Form
        layout="vertical"
        initialValues={{ customerId }}
        onFinish={(values: CardPolicy & { code: string; customerId: string }) => {
          const actions = useAppStore.getState()
          const saved = report(
            replacing
              ? actions.replaceCard(replacing.id, values.code)
              : actions.issueCard(values.customerId, values.code, {
                  dailyLimit: values.dailyLimit ?? null,
                  allowedMachineIds: values.allowedMachineIds ?? [],
                }),
            replacing ? 'Đã cấp thẻ mới' : 'Đã phát hành thẻ',
          )
          if (saved) {
            onClose()
            onSaved?.(saved)
          }
        }}
      >
        {replacing ? (
          <p className="flow-note">
            Thẻ {replacing.code} sẽ bị vô hiệu hóa. Thẻ mới sử dụng ví và hạn mức hiện tại.
          </p>
        ) : (
          <SelectField
            name="customerId"
            label="Khách hàng"
            options={customers
              .filter((c) => c.active)
              .map((c) => ({ value: c.id, label: c.code + ' · ' + c.name }))}
          />
        )}
        <TextField name="code" label={replacing ? 'Mã thẻ mới' : 'Mã thẻ'} />
        {!replacing && <CardPolicyFields />}
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {replacing ? 'Xác nhận cấp lại' : 'Phát hành'}
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
