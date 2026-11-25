import { Button, Form } from 'antd'
import { PageHeader } from '../../components/common/PageHeader'
import { NumberField, TextField } from '../../components/common/FormFields'
import { useAction } from '../../components/common/ConfirmDialog'
import { useAppStore } from '../../stores/useAppStore'
import type { Settings } from '../../types/common'
export default function SettingsPage() {
  const settings = useAppStore((s) => s.db.settings)
  const [form] = Form.useForm<Settings>()
  const { confirm, report } = useAction()
  return (
    <div className="page-stack">
      <PageHeader
        title="Cài đặt"
        description="Tùy chỉnh tên ứng dụng và quy tắc mặc định cho dữ liệu mô phỏng."
      />
      <section className="panel panel-pad">
        <div className="panel-title">
          <h2>Cấu hình chung</h2>
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={settings}
          onFinish={(v) => report(useAppStore.getState().updateSettings(v))}
        >
          <div className="form-grid">
            <TextField name="displayName" label="Tên hiển thị" />
            <NumberField name="lowThreshold" label="Ngưỡng tồn mặc định cho ô mới" />
          </div>
          <div className="form-submit">
            <Button type="primary" htmlType="submit">
              Lưu cài đặt
            </Button>
          </div>
        </Form>
      </section>
      <section className="panel panel-pad">
        <div className="panel-title">
          <div>
            <h2>Khôi phục dữ liệu demo</h2>
            <p>Thay toàn bộ dữ liệu và cấu hình hiện tại bằng bộ dữ liệu mẫu mới.</p>
          </div>
        </div>
        <Button
          danger
          onClick={() =>
            confirm(
              'Đặt lại dữ liệu demo',
              'Toàn bộ thay đổi trong trình duyệt này sẽ bị xóa.',
              () => {
                const result = useAppStore.getState().resetDemo()
                form.setFieldsValue(result.data.settings)
                return result
              },
              'Đã khôi phục dữ liệu demo',
            )
          }
        >
          Đặt lại dữ liệu
        </Button>
      </section>
    </div>
  )
}
