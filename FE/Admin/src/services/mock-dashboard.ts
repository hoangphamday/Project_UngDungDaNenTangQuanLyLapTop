import type { DashboardData } from '../types/dashboard'

export const mockDashboardData: DashboardData = {
  stats: [
    { id: 'revenue', label: 'Tổng doanh thu', value: '2,84 tỷ', change: 12.5, comparison: 'so với tháng trước', tone: 'indigo' },
    { id: 'orders', label: 'Tổng đơn hàng', value: '1.428', change: 8.2, comparison: 'so với tháng trước', tone: 'green' },
    { id: 'customers', label: 'Tổng khách hàng', value: '8.549', change: 5.7, comparison: 'so với tháng trước', tone: 'orange' },
    { id: 'products', label: 'Tổng sản phẩm', value: '326', change: -1.4, comparison: 'so với tháng trước', tone: 'blue' },
  ],
  revenue: [
    { month: 'T1', revenue: 168 }, { month: 'T2', revenue: 186 }, { month: 'T3', revenue: 178 },
    { month: 'T4', revenue: 224 }, { month: 'T5', revenue: 242 }, { month: 'T6', revenue: 230 },
    { month: 'T7', revenue: 278 }, { month: 'T8', revenue: 259 }, { month: 'T9', revenue: 310 },
    { month: 'T10', revenue: 294 }, { month: 'T11', revenue: 335 }, { month: 'T12', revenue: 368 },
  ],
  recentOrders: [
    { id: '#LP-10428', customer: 'Nguyễn Minh Anh', email: 'minhanh@gmail.com', date: '17/09/2026', amount: 25990000, status: 'Đã giao' },
    { id: '#LP-10427', customer: 'Trần Quốc Bảo', email: 'quocbao@gmail.com', date: '17/09/2026', amount: 18490000, status: 'Đang xử lý' },
    { id: '#LP-10426', customer: 'Lê Hoàng Nam', email: 'hoangnam@gmail.com', date: '16/09/2026', amount: 32990000, status: 'Chờ xác nhận' },
    { id: '#LP-10425', customer: 'Phạm Thu Hà', email: 'thuha@gmail.com', date: '16/09/2026', amount: 21490000, status: 'Đã giao' },
    { id: '#LP-10424', customer: 'Vũ Đức Long', email: 'duclong@gmail.com', date: '15/09/2026', amount: 45990000, status: 'Đang xử lý' },
  ],
  lowStockProducts: [
    { id: '1', name: 'MacBook Air M3 13 inch', sku: 'MBA-M3-13-256', stock: 3 },
    { id: '2', name: 'ASUS ROG Zephyrus G14', sku: 'AS-G14-2026', stock: 4 },
    { id: '3', name: 'Dell XPS 13 Plus', sku: 'DE-XPS13-9320', stock: 5 },
    { id: '4', name: 'Lenovo ThinkPad X1', sku: 'LE-X1-CARBON', stock: 6 },
  ],
}
