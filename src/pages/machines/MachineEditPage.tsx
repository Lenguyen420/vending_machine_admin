import { useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { MachineWizard } from '../../components/machines/MachineWizard'
import { useAppStore } from '../../stores/useAppStore'
import NotFoundPage from '../NotFoundPage'
export default function MachineEditPage() {
  const { id } = useParams()
  const machine = useAppStore((s) => s.db.machines.find((m) => m.id === id))
  if (!machine) return <NotFoundPage />
  return (
    <>
      <PageHeader title={'Chỉnh sửa ' + machine.code} description={machine.name + ' · ' + machine.location} />
      <MachineWizard key={machine.id} machine={machine} />
    </>
  )
}
