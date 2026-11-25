import { Button, Form } from 'antd'
import { FormModal, SelectField, TextField } from '../common/FormFields'
import { useAction } from '../common/ConfirmDialog'
import { useAppStore } from '../../stores/useAppStore'
import type { MaintenanceTicket } from '../../types/common'
import type { TicketInput } from '../../services/alertService'
import { options, priorityLabels, ticketStatus } from '../../static/status'
export function MaintenanceForm({
  ticket,
  machineId,
  onClose,
}: {
  ticket?: MaintenanceTicket
  machineId?: string
  onClose: () => void
}) {
  const machines = useAppStore((s) => s.db.machines)
  const { report } = useAction()
  return (
    <FormModal title={ticket ? 'Cập nhật phiếu bảo trì' : 'Tạo phiếu bảo trì'} onClose={onClose}>
      <Form
        layout="vertical"
        initialValues={ticket ?? { machineId, priority: 'MEDIUM', status: 'OPEN' }}
        onFinish={(v: TicketInput) => {
          const actions = useAppStore.getState()
          if (report(ticket ? actions.updateMaintenance(ticket.id, v) : actions.createMaintenance(v)))
            onClose()
        }}
      >
        <SelectField
          name="machineId"
          label="Máy bán hàng"
          options={machines.map((m) => ({ value: m.id, label: m.code + ' · ' + m.name }))}
        />
        <TextField name="description" label="Mô tả" area />
        <TextField name="assignee" label="Kỹ thuật viên mô phỏng" />
        <div className="form-grid">
          <SelectField name="priority" label="Ưu tiên" options={options(priorityLabels)} />
          <SelectField name="status" label="Trạng thái" options={options(ticketStatus)} />
        </div>
        <div className="form-submit">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu phiếu
          </Button>
        </div>
      </Form>
    </FormModal>
  )
}
