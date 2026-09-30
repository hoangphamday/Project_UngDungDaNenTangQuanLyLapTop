export type StatTone = 'indigo' | 'green' | 'orange' | 'blue'
export interface DashboardStat { id: string; label: string; value: string; change: number; comparison: string; tone: StatTone }
export interface RevenuePoint { month: string; revenue: number; orders: number }
export type OrderStatus = 'Đã giao' | 'Đang xử lý' | 'Chờ xác nhận'
export interface RecentOrder { id: string; customer: string; email: string; date: string; amount: number; status: OrderStatus }
export interface LowStockProduct { id: string; name: string; sku: string; stock: number }
export interface DashboardData { stats: DashboardStat[]; revenue: RevenuePoint[]; recentOrders: RecentOrder[]; lowStockProducts: LowStockProduct[] }
