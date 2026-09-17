import type { RecentOrder } from '../../types/dashboard'
import { formatCurrency, getInitials } from '../../utils/formatters'

const statusClass = { 'Đã giao': 'delivered', 'Đang xử lý': 'processing', 'Chờ xác nhận': 'pending' }
export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Đơn hàng gần đây</h2><p className="panel-subtitle">5 đơn hàng mới nhất trong hệ thống</p></div><button className="panel-action" type="button">Xem tất cả</button></div><div className="table-wrap"><table className="orders-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Giá trị</th><th>Trạng thái</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><span className="order-code">{order.id}</span></td><td><div className="customer-cell"><span className="customer-avatar">{getInitials(order.customer)}</span><div><div className="customer-name">{order.customer}</div><div className="customer-email">{order.email}</div></div></div></td><td>{order.date}</td><td><span className="amount">{formatCurrency(order.amount)}</span></td><td><span className={`status ${statusClass[order.status]}`}>{order.status}</span></td></tr>)}</tbody></table></div></section>
}
