import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '../layouts/AdminLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { ManagementPage } from '../pages/ManagementPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProfilePage } from '../pages/ProfilePage'
import { navigationItems } from './navigation'

export function AppRoutes() {
  return <BrowserRouter><Routes><Route element={<AdminLayout />}><Route index element={<DashboardPage />} />{navigationItems.filter((item) => item.path !== '/').map((item) => <Route key={item.path} path={item.path} element={<ManagementPage />} />)}<Route path="/ho-so" element={<ProfilePage />} /><Route path="*" element={<NotFoundPage />} /></Route></Routes></BrowserRouter>
}
