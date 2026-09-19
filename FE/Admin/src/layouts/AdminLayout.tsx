import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('lapzone-sidebar') === 'collapsed')
  const location = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [location.pathname])
  const toggle = () => setCollapsed((value) => { localStorage.setItem('lapzone-sidebar', value ? 'expanded' : 'collapsed'); return !value })
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}><Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} onToggle={toggle} /><div className="main-area"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="page-content"><Outlet /></main><footer className="app-footer"><span>© 2026 LapZone Admin</span><span>Phiên bản 1.0.0 · Dữ liệu đang ở chế độ demo</span></footer></div></div>
}
