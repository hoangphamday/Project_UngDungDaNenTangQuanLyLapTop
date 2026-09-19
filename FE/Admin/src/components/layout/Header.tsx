import { useEffect, useRef, useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, Search, Settings, UserRound, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key === 'k') { event.preventDefault(); searchRef.current?.focus() } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [])
  return <header className="header"><button className="menu-button" onClick={onMenuClick} aria-label="Mở menu"><Menu size={20} /></button><label className="global-search"><Search size={17} /><input ref={searchRef} type="search" placeholder="Tìm sản phẩm, đơn hàng, khách hàng..." /><kbd>Ctrl K</kbd></label>
    <div className="header-actions"><div className="dropdown-wrap"><button className="icon-button" onClick={() => { setNotificationsOpen(!notificationsOpen); setAccountOpen(false) }} aria-label="Thông báo"><Bell size={18} /><span className="notification-dot" /></button>{notificationsOpen && <div className="dropdown notification-menu"><div className="dropdown-title"><strong>Thông báo</strong><button onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div><div className="notification-item unread"><span className="notification-icon">ĐH</span><div><strong>Đơn hàng mới #LZ-10429</strong><p>Khách hàng vừa đặt đơn trị giá 28.990.000đ</p><small>2 phút trước</small></div></div><div className="notification-item"><span className="notification-icon warning">KH</span><div><strong>Cảnh báo tồn kho</strong><p>4 sản phẩm đã dưới mức tồn tối thiểu</p><small>30 phút trước</small></div></div><button className="dropdown-footer">Xem tất cả thông báo</button></div>}</div>
      <span className="header-divider" /><div className="dropdown-wrap"><button className="header-user" onClick={() => { setAccountOpen(!accountOpen); setNotificationsOpen(false) }}><div className="avatar">AD</div><div className="header-user-copy"><strong>Administrator</strong><span>Super Admin</span></div><ChevronDown size={14} /></button>{accountOpen && <div className="dropdown account-menu"><Link to="/ho-so" onClick={() => setAccountOpen(false)}><UserRound size={16} />Hồ sơ cá nhân</Link><Link to="/ho-so" onClick={() => setAccountOpen(false)}><Settings size={16} />Cài đặt tài khoản</Link><button onClick={() => window.confirm('Bạn có chắc muốn đăng xuất?')}><LogOut size={16} />Đăng xuất</button></div>}</div></div>
  </header>
}
