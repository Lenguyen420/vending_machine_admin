import { Breadcrumb } from 'antd'
import { Link, useLocation } from 'react-router-dom'
import { groups, pageLabels } from '../../static/menu'
import { useAppStore } from '../../stores/useAppStore'
export function Breadcrumbs() {
  const db = useAppStore((s) => s.db)
  const segments = useLocation().pathname.split('/').filter(Boolean)
  const base = groups.flatMap((g) => g.items).find((item) => item.path === '/' + segments[0])
  const entity = (part: string) =>
    db.machines.find((m) => m.id === part)?.code ??
    db.cards.find((c) => c.id === part)?.code ??
    db.customers.find((c) => c.id === part)?.code ??
    'Chi tiết'
  const items = [
    { title: segments.length ? <Link to="/">Tổng quan</Link> : 'Tổng quan' },
    ...segments.map((part, i) => {
      const label = i === 0 ? (base?.label ?? 'Trang không tồn tại') : (pageLabels[part] ?? entity(part))
      return {
        title:
          i < segments.length - 1 ? (
            <Link to={'/' + segments.slice(0, i + 1).join('/')}>{label}</Link>
          ) : (
            label
          ),
      }
    }),
  ]
  return <Breadcrumb items={items} />
}
