import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/Header'
import { Sidebar } from '../components/Sidebar'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return <div className="app-shell"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="main-area"><Header onMenuClick={() => setSidebarOpen(true)} /><main className="page-content"><Outlet /></main></div></div>
}
