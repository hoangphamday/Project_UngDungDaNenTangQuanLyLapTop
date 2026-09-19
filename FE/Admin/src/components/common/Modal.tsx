import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ModalProps { title: string; description?: string; children: ReactNode; onClose: () => void; footer?: ReactNode }
export function Modal({ title, description, children, onClose, footer }: ModalProps) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Đóng"><X size={18} /></button></div>
      <div className="modal-body">{children}</div>{footer && <div className="modal-footer">{footer}</div>}
    </section>
  </div>
}
