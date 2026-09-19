import { CalendarDays, Download } from 'lucide-react'
import { BestSellers } from '../components/dashboard/BestSellers'
import { LowStockList } from '../components/dashboard/LowStockList'
import { RecentOrders } from '../components/dashboard/RecentOrders'
import { RevenueChart } from '../components/dashboard/RevenueChart'
import { StatCard } from '../components/dashboard/StatCard'
import { mockDashboardData } from '../services/mock-dashboard'
export function DashboardPage() { const data = mockDashboardData; return <><div className="page-heading dashboard-heading"><div><p className="eyebrow">Tổng quan hệ thống</p><h1 className="page-title">Chào buổi sáng, Administrator</h1><p className="page-description">Đây là tình hình hoạt động của LapZone hôm nay.</p></div><div className="heading-actions"><button className="button button-secondary"><CalendarDays size={16} />19/09/2026</button><button className="button button-primary"><Download size={16} />Xuất báo cáo</button></div></div><div className="stats-grid">{data.stats.map((stat) => <StatCard key={stat.id} stat={stat} />)}</div><div className="dashboard-grid"><RevenueChart data={data.revenue} /><LowStockList products={data.lowStockProducts} /></div><div className="dashboard-bottom"><RecentOrders orders={data.recentOrders} /><BestSellers /></div></> }
