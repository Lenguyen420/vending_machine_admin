import { LinkButton } from '../../components/common/LinkButton'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'
import { MachineSimulator } from '../../components/machines/MachineSimulator'
import { useAppStore } from '../../stores/useAppStore'
import NotFoundPage from '../NotFoundPage'
export default function MachineSimulatorPage() {
  const { id } = useParams()
  const machine = useAppStore((s) => s.db.machines.find((m) => m.id === id))
  if (!machine) return <NotFoundPage />
  return (
    <>
      <PageHeader
        title="Mô phỏng mua hàng"
        description={machine.code + ' · ' + machine.name + ' · ' + machine.location}
        actions={<LinkButton to={'/machines/' + machine.id}>Về chi tiết máy</LinkButton>}
      />
      <MachineSimulator key={machine.id} machine={machine} />
    </>
  )
}
