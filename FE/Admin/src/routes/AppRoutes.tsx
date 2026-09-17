import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { navigationItems } from './navigation'

export function AppRoutes() {
  return <BrowserRouter><Routes><Route element={<AdminLayout />}><Route index element={<DashboardPage />} />{navigationItems.filter((item) => item.path !== '/').map((item) => <Route key={item.path} path={item.path} element={<PlaceholderPage />} />)}<Route path="*" element={<PlaceholderPage />} /></Route></Routes></BrowserRouter>
}
