import { CalendarDays } from 'lucide-react'
import { LowStockList } from '../components/dashboard/LowStockList'
import { RecentOrders } from '../components/dashboard/RecentOrders'
import { RevenueChart } from '../components/dashboard/RevenueChart'
import { StatCard } from '../components/dashboard/StatCard'
import { mockDashboardData } from '../services/mock-dashboard'

export function DashboardPage() {
  const data = mockDashboardData
  return <><div className="page-heading"><div><p className="eyebrow">Tổng quan hệ thống</p><h1 className="page-title">Chào buổi sáng, Administrator</h1><p className="page-description">Theo dõi tình hình kinh doanh cửa hàng của bạn hôm nay.</p></div><div className="date-chip"><CalendarDays size={15} />17 tháng 09, 2026</div></div><div className="stats-grid">{data.stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}</div><div className="dashboard-grid"><RevenueChart data={data.revenue} /><LowStockList products={data.lowStockProducts} /></div><RecentOrders orders={data.recentOrders} /></>
}
