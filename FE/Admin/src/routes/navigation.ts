import { BadgePercent, Boxes, Building2, ClipboardList, GalleryHorizontalEnd, Gauge, Laptop, MessageSquareText, PackageOpen, ShoppingCart, Tags, Truck, Users, UserRoundCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem { label: string; path: string; icon: LucideIcon; group: 'Tổng quan' | 'Quản lý bán hàng' | 'Nội dung' }
export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/', icon: Gauge, group: 'Tổng quan' },
  { label: 'Sản phẩm Laptop', path: '/san-pham', icon: Laptop, group: 'Quản lý bán hàng' },
  { label: 'Danh mục', path: '/danh-muc', icon: Tags, group: 'Quản lý bán hàng' },
  { label: 'Hãng Laptop', path: '/hang-laptop', icon: Building2, group: 'Quản lý bán hàng' },
  { label: 'Đơn hàng', path: '/don-hang', icon: ShoppingCart, group: 'Quản lý bán hàng' },
  { label: 'Khách hàng', path: '/khach-hang', icon: Users, group: 'Quản lý bán hàng' },
  { label: 'Nhân viên', path: '/nhan-vien', icon: UserRoundCog, group: 'Quản lý bán hàng' },
  { label: 'Kho hàng', path: '/kho-hang', icon: Boxes, group: 'Quản lý bán hàng' },
  { label: 'Phiếu nhập', path: '/phieu-nhap', icon: ClipboardList, group: 'Quản lý bán hàng' },
  { label: 'Nhà cung cấp', path: '/nha-cung-cap', icon: Truck, group: 'Quản lý bán hàng' },
  { label: 'Khuyến mãi', path: '/khuyen-mai', icon: BadgePercent, group: 'Nội dung' },
  { label: 'Banner', path: '/banner', icon: GalleryHorizontalEnd, group: 'Nội dung' },
  { label: 'Đánh giá', path: '/danh-gia', icon: MessageSquareText, group: 'Nội dung' },
]
export const fallbackIcon = PackageOpen
