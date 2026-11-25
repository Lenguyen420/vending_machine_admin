import { Button, Form, Input, Space } from 'antd'
import { useAppStore } from '../../stores/useAppStore'
import { cardWallet } from '../../stores/selectors'
import { topUpMethods } from '../../static/constants'
import { FormModal, NumberField, SelectField } from '../common/FormFields'
import { MoneyText } from '../common/MoneyText'
import { useAction } from '../common/ConfirmDialog'
export function TopUpModal({ cardId, onClose }: { cardId?: string; onClose: () => void }) {
  const db = useAppStore((s) => s.db)
  const [form] = Form.useForm()
  const { report } = useAction()
  const activeCardId = Form.useWatch('cardId', form) ?? cardId
  const amount = Form.useWatch('amount', form) ?? 0
  const wallet = cardWallet(db, activeCardId)
  const choices = db.cards
    .filter(
      (c) =>
        c.status === 'ACTIVE' &&
        db.customers.find((person) => person.id === cardWallet(db, c.id)?.customerId)?.active,
    )
    .map((c) => ({
      value: c.id,
      label:
        c.code + ' · ' + db.customers.find((person) => person.id === cardWallet(db, c.id)?.customerId)?.name,
    }))
  return (
    <FormModal title="Nạp tiền vào ví" onClose={onClose}>
      <Form
        form={form}
        layout="vertical"
        initialValues={{ cardId, method: topUpMethods[0] }}
        onFinish={(values) => {
          if (
            report(
              useAppStore.getState().topUp(values.cardId, values.amount, values.method, values.note ?? ''),
              'Đã nạp tiền vào ví',
            )
          )
            onClose()
        }}
      >
        <SelectField name="cardId" label="Thẻ nội bộ" options={choices} />
        <NumberField name="amount" label="Số tiền (VNĐ)" min={1} />
        <Space wrap>
          {[20000, 50000, 100000, 200000].map((value) => (
            <Button key={value} onClick={() => form.setFieldValue('amount', value)}>
              <MoneyText value={value} />
            </Button>
          ))}
        </Space>
        <div className="flow-note" />
        <SelectField
          name="method"
          label="Phương thức"
          options={topUpMethods.map((value) => ({ value, label: value }))}
        />
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={2} />
        </Form.Item>
        {wallet && (
          <dl className="detail-list">
            <div>
              <dt>Số dư trước</dt>
              <dd>
                <MoneyText value={wallet.balance} />
              </dd>
            </div>
            <div>
              <dt>Số dư dự kiến</dt>
              <dd>
                <MoneyText value={wallet.balance + amount} />
              </dd>
            </div>
          </dl>
        )}
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Xác nhận nạp tiền
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
