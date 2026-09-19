import { ChevronLeft, ChevronRight, LaptopMinimal } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationGroups, navigationItems } from '../../routes/navigation'

interface Props { open: boolean; collapsed: boolean; onClose: () => void; onToggle: () => void }
export function Sidebar({ open, collapsed, onClose, onToggle }: Props) {
  return <><aside className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
    <div className="brand"><div className="brand-mark"><LaptopMinimal size={22} /></div><div className="brand-copy"><span className="brand-title">LapZone</span><span className="brand-subtitle">ADMIN CONSOLE</span></div><button className="collapse-button" onClick={onToggle} aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}>{collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button></div>
    <nav className="sidebar-nav" aria-label="Điều hướng chính">{navigationGroups.map((group) => <div key={group} className="nav-group"><div className="nav-label">{group}</div>{navigationItems.filter((item) => item.group === group).map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/'} title={collapsed ? item.label : undefined} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}><Icon size={18} /><span>{item.label}</span></NavLink> })}</div>)}</nav>
  </aside>{open && <button className="sidebar-overlay" type="button" aria-label="Đóng menu" onClick={onClose} />}</>
}
