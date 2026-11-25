import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
export function StatCard({
  title,
  value,
  detail,
  icon,
  tone = 'blue',
  href,
}: {
  title: string
  value: ReactNode
  detail?: ReactNode
  icon: ReactNode
  tone?: string
  href?: string
}) {
  const body = (
    <>
      <div className={'stat-icon ' + tone}>{icon}</div>
      <div className="stat-label">{title}</div>
      <div className="stat-value">{value}</div>
      {detail && <div className="stat-detail">{detail}</div>}
    </>
  )
  return href ? (
    <Link className="panel stat-card stat-link" to={href}>
      {body}
    </Link>
  ) : (
    <section className="panel stat-card">{body}</section>
  )
}
