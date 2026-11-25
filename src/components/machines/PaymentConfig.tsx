import { Button, Checkbox, Form } from 'antd'
import type { Machine } from '../../types/machine'
import { methods, options } from '../../static/status'
import { useAppStore } from '../../stores/useAppStore'
import { SelectField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
import { TerminalField } from './MachineForm'
export function PaymentFields() {
  return (
    <>
      <Form.Item name="methods" label="Phương thức chấp nhận">
        <Checkbox.Group options={options(methods)} />
      </Form.Item>
      <div className="form-grid">
        <TerminalField />
        <SelectField
          name="reader"
          label="Đầu đọc thẻ"
          options={[
            { value: 'OK', label: 'Sẵn sàng' },
            { value: 'ERROR', label: 'Lỗi mô phỏng' },
          ]}
        />
      </div>
    </>
  )
}
export function PaymentConfig({ machine }: { machine: Machine }) {
  const update = useAppStore((s) => s.updateMachine)
  const { report } = useAction()
  return (
    <Form
      layout="vertical"
      initialValues={machine}
      onFinish={(values) => report(update(machine.id, { ...machine, ...values }))}
    >
      <PaymentFields />
      <div className="form-submit">
        <Button htmlType="submit" type="primary">
          Lưu thanh toán
        </Button>
      </div>
    </Form>
  )
}
