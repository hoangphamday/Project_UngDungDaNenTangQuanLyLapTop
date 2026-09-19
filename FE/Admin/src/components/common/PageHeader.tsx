import { Plus } from 'lucide-react'
import { Button } from './Button'

interface Props { eyebrow: string; title: string; description: string; action?: string; onAction?: () => void }
export function PageHeader({ eyebrow, title, description, action, onAction }: Props) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="page-description">{description}</p></div>{action && <Button onClick={onAction}><Plus size={17} />{action}</Button>}</div>
}
