import { Bell, ChevronDown, Menu, Search } from 'lucide-react'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return <header className="header">
    <button className="menu-button" type="button" onClick={onMenuClick} aria-label="Mở menu"><Menu size={20} /></button>
    <label className="search"><Search size={17} /><input type="search" placeholder="Tìm kiếm sản phẩm, đơn hàng..." aria-label="Tìm kiếm" /><span className="search-kbd">⌘ K</span></label>
    <div className="header-actions"><button className="icon-button" type="button" aria-label="Thông báo"><Bell size={18} /><span className="notification-dot" /></button><span className="header-divider" /><div className="header-user"><div className="avatar">AD</div><div className="header-user-copy"><strong>Administrator</strong><span>Super Admin</span></div><ChevronDown size={14} color="#98a2b3" /></div></div>
  </header>
}
