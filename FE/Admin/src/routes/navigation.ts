import {
  BadgePercent,
  BellRing,
  Boxes,
  Building2,
  ClipboardList,
  CreditCard,
  Gauge,
  Laptop,
  MessageSquareText,
  PackageSearch,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationGroup =
  | "Tổng quan"
  | "Bán hàng"
  | "Sản phẩm"
  | "Kho hàng"
  | "Marketing"
  | "Người dùng";
export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  group: NavigationGroup;
}
export const navigationGroups: NavigationGroup[] = [
  "Tổng quan",
  "Bán hàng",
  "Sản phẩm",
  "Kho hàng",
  "Marketing",
  "Người dùng",
];
export const navigationItems: NavigationItem[] = [
  { label: "Tổng quan", path: "/", icon: Gauge, group: "Tổng quan" },
  {
    label: "Đơn hàng",
    path: "/don-hang",
    icon: ShoppingCart,
    group: "Bán hàng",
  },
  {
    label: "Thanh toán",
    path: "/thanh-toan",
    icon: CreditCard,
    group: "Bán hàng",
  },
  {
    label: "Đánh giá",
    path: "/danh-gia",
    icon: MessageSquareText,
    group: "Bán hàng",
  },
  { label: "Laptop", path: "/san-pham", icon: Laptop, group: "Sản phẩm" },
  { label: "Biến thể laptop", path: "/bien-the", icon: Laptop, group: "Sản phẩm" },
  {
    label: "Danh mục",
    path: "/danh-muc",
    icon: PackageSearch,
    group: "Sản phẩm",
  },
  {
    label: "Hãng Laptop",
    path: "/hang-laptop",
    icon: Building2,
    group: "Sản phẩm",
  },
  { label: "Tồn kho", path: "/kho-hang", icon: Boxes, group: "Kho hàng" },
  {
    label: "Danh sách kho",
    path: "/danh-sach-kho",
    icon: Building2,
    group: "Kho hàng",
  },
  {
    label: "Phiếu nhập",
    path: "/phieu-nhap",
    icon: ClipboardList,
    group: "Kho hàng",
  },
  {
    label: "Nhà cung cấp",
    path: "/nha-cung-cap",
    icon: Truck,
    group: "Kho hàng",
  },
  {
    label: "Khuyến mãi",
    path: "/khuyen-mai",
    icon: BadgePercent,
    group: "Marketing",
  },
  {
    label: "Thông báo",
    path: "/thong-bao",
    icon: BellRing,
    group: "Marketing",
  },
  {
    label: "Khách hàng",
    path: "/khach-hang",
    icon: Users,
    group: "Người dùng",
  },
  {
    label: "Nhân viên",
    path: "/nhan-vien",
    icon: UserRoundCog,
    group: "Người dùng",
  },
  {
    label: "Tài khoản",
    path: "/tai-khoan",
    icon: ShieldCheck,
    group: "Người dùng",
  },
];
