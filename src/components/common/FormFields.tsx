import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd'
import type { ReactNode } from 'react'
import type { Rule } from 'antd/es/form'
const required: Rule[] = [{ required: true, message: 'Vui lòng nhập hoặc chọn giá trị.' }]
const integer = (min = 0, max?: number): Rule[] => [
  ...required,
  {
    type: 'integer',
    min,
    max,
    message:
      max === undefined ? 'Nhập số nguyên từ ' + min + '.' : 'Nhập số nguyên từ ' + min + ' đến ' + max + '.',
  },
]
export function TextField({ name, label, area = false }: { name: string; label: string; area?: boolean }) {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[
        { required: true, whitespace: true, message: 'Vui lòng nhập ' + label.toLocaleLowerCase('vi') + '.' },
      ]}
    >
      {area ? <Input.TextArea rows={3} /> : <Input />}
    </Form.Item>
  )
}
export function NumberField({
  name,
  label,
  min = 0,
  max,
  optional = false,
}: {
  name: string
  label: string
  min?: number
  max?: number
  optional?: boolean
}) {
  return (
    <Form.Item name={name} label={label} rules={optional ? [] : integer(min, max)}>
      <InputNumber
        min={min}
        max={max}
        precision={0}
        className="full-width"
        placeholder={optional ? 'Để trống nếu không áp dụng' : undefined}
      />
    </Form.Item>
  )
}
export function SelectField<T extends string>({
  name,
  label,
  options,
  multiple = false,
  optional = false,
  disabled = false,
}: {
  name: string
  label: string
  options: { value: T; label: string; disabled?: boolean }[]
  multiple?: boolean
  optional?: boolean
  disabled?: boolean
}) {
  return (
    <Form.Item name={name} label={label} rules={optional ? [] : required}>
      <Select
        virtual={false}
        showSearch={{ optionFilterProp: 'label' }}
        mode={multiple ? 'multiple' : undefined}
        allowClear={optional}
        options={options}
        disabled={disabled}
      />
    </Form.Item>
  )
}
export function SwitchField({ name, label }: { name: string; label: string }) {
  return (
    <Form.Item name={name} label={label} valuePropName="checked">
      <Switch />
    </Form.Item>
  )
}
export function FormModal({
  title,
  onClose,
  children,
  width = 560,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}) {
  return (
    <Modal open title={title} onCancel={onClose} footer={null} width={width}>
      {children}
    </Modal>
  )
}
