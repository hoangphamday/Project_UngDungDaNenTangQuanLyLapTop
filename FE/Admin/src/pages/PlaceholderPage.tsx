import { useLocation } from 'react-router-dom'
import { fallbackIcon, navigationItems } from '../routes/navigation'

export function PlaceholderPage() {
  const { pathname } = useLocation(); const item = navigationItems.find((navItem) => navItem.path === pathname); const Icon = item?.icon ?? fallbackIcon
  return <div className="placeholder-page"><section className="placeholder-card"><div className="placeholder-icon"><Icon size={26} /></div><h1>{item?.label ?? 'Trang không tồn tại'}</h1><p>Khu vực quản lý {item?.label.toLowerCase() ?? 'này'} đã sẵn sàng để tích hợp dữ liệu và nghiệp vụ trong giai đoạn tiếp theo.</p></section></div>
}
