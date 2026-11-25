const colors: Record<string, string> = {
  ONLINE: 'green',
  OFFLINE: 'red',
  MAINTENANCE: 'orange',
  ACTIVE: 'green',
  LOCKED: 'red',
  REPLACED: 'gray',
  SUCCESS: 'green',
  FAILED: 'red',
  REFUNDED: 'blue',
  PAID: 'green',
  NOT_ATTEMPTED: 'gray',
  OPEN: 'orange',
  ACKNOWLEDGED: 'blue',
  RESOLVED: 'green',
  DONE: 'green',
  IN_PROGRESS: 'blue',
  available: 'green',
  low: 'orange',
  empty: 'red',
  inactive: 'gray',
  unassigned: 'gray',
  HIGH: 'red',
  MEDIUM: 'orange',
  LOW: 'gray',
}
export function StatusTag({ value, labels }: { value: string; labels: Record<string, string> }) {
  return (
    <span className={'status-tag ' + (colors[value] ?? 'gray')}>
      <span className="status-dot" />
      {labels[value] ?? value}
    </span>
  )
}
