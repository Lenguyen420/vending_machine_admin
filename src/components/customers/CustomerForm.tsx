import { Button, Form } from 'antd'
import { FormModal, SelectField, SwitchField, TextField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
import { useAppStore } from '../../stores/useAppStore'
import { customerGroups } from '../../static/constants'
import type { Customer } from '../../types/wallet'
export function CustomerForm({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const { report } = useAction()
  return (
    <FormModal title={customer ? 'Sửa khách hàng' : 'Thêm khách hàng'} onClose={onClose}>
      <Form
        layout="vertical"
        initialValues={customer ?? { active: true }}
        onFinish={(values: Omit<Customer, 'id'>) => {
          const state = useAppStore.getState()
          if (report(customer ? state.updateCustomer(customer.id, values) : state.createCustomer(values)))
            onClose()
        }}
      >
        <TextField name="code" label="Mã khách hàng" />
        <TextField name="name" label="Họ và tên" />
        <SelectField
          name="group"
          label="Nhóm"
          options={customerGroups.map((value) => ({ value, label: value }))}
        />
        <SwitchField name="active" label="Hoạt động" />
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu khách hàng
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
