import { ChevronRight, LaptopMinimal, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationItems } from '../routes/navigation'

interface SidebarProps { open: boolean; onClose: () => void }
const groups = ['Tổng quan', 'Quản lý bán hàng', 'Nội dung'] as const

export function Sidebar({ open, onClose }: SidebarProps) {
  return <>
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><div className="brand-mark"><LaptopMinimal size={21} strokeWidth={2.2} /></div><div><span className="brand-title">LAPTOPHUB</span><span className="brand-subtitle">ADMIN CONSOLE</span></div></div>
      <nav className="sidebar-nav" aria-label="Điều hướng chính">
        {groups.map((group) => <div key={group}><div className="nav-label">{group}</div>
          {navigationItems.filter((item) => item.group === group).map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/'} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onClose}><Icon size={18} strokeWidth={1.8} /><span>{item.label}</span><ChevronRight className="nav-arrow" size={13} /></NavLink> })}
        </div>)}
      </nav>
      <div className="sidebar-profile"><div className="avatar">AD</div><div className="profile-copy"><span className="profile-name">Administrator</span><span className="profile-role">Quản trị viên</span></div><LogOut size={16} color="#758198" /></div>
    </aside>
    {open && <button className="sidebar-overlay" type="button" aria-label="Đóng menu" onClick={onClose} />}
  </>
}
