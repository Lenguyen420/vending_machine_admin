import { Button, Form } from 'antd'
import type { Card, CardPolicy } from '../../types/wallet'
import { useAppStore } from '../../stores/useAppStore'
import { NumberField, SelectField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
export function CardPolicyFields() {
  const machines = useAppStore((s) => s.db.machines)
  return (
    <>
      <NumberField name="dailyLimit" label="Hạn mức ngày (VNĐ)" optional />
      <SelectField
        name="allowedMachineIds"
        label="Máy được phép (để trống để dùng mọi máy)"
        multiple
        optional
        options={machines.map((m) => ({ value: m.id, label: m.code + ' · ' + m.name }))}
      />
    </>
  )
}
export function CardPolicyForm({ card }: { card: Card }) {
  const update = useAppStore((s) => s.updateCardPolicy)
  const { report } = useAction()
  return (
    <Form
      layout="vertical"
      initialValues={card}
      onFinish={(values: CardPolicy) =>
        report(
          update(card.id, {
            dailyLimit: values.dailyLimit ?? null,
            allowedMachineIds: values.allowedMachineIds ?? [],
          }),
        )
      }
    >
      <CardPolicyFields />
      <div className="form-submit">
        <Button type="primary" htmlType="submit">
          Lưu hạn mức
        </Button>
      </div>
    </Form>
  )
}
