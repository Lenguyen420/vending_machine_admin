import { Button, Form } from 'antd'
import type { Category } from '../../types/product'
import { useAppStore } from '../../stores/useAppStore'
import { FormModal, SwitchField, TextField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
export function CategoryForm({ category, onClose }: { category?: Category; onClose: () => void }) {
  const save = useAppStore((s) => s.saveCategory)
  const { report } = useAction()
  return (
    <FormModal title={category ? 'Sửa danh mục' : 'Thêm danh mục'} onClose={onClose}>
      <Form
        layout="vertical"
        initialValues={category ?? { active: true }}
        onFinish={(v) => {
          if (report(save(v, category?.id))) onClose()
        }}
      >
        <TextField name="name" label="Tên danh mục" />
        <SwitchField name="active" label="Hoạt động" />
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu danh mục
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
