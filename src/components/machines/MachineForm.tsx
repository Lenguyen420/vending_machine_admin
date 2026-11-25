import { Form, Input } from 'antd'
import { TextField } from '../common/FormFields'
export function MachineForm() {
  return (
    <div className="form-grid">
      <TextField label="Tên máy" name="name" />
      <TextField label="Mã máy" name="code" />
      <TextField label="Địa điểm" name="location" />
      <TextField label="Model" name="model" />
      <TextField label="Số serial" name="serial" />
      <TextField label="Người phụ trách" name="manager" />
    </div>
  )
}
export function TerminalField() {
  return (
    <Form.Item name="terminal" label="Mã terminal mô phỏng">
      <Input />
    </Form.Item>
  )
}
