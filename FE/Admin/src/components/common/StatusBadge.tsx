import { statusTones } from '../../services/mock-management'

export function StatusBadge({ value }: { value: string }) {
  return <span className={`badge badge-${statusTones[value] ?? 'neutral'}`}><i />{value}</span>
}
