import type { ImageSource } from 'expo-image';

export type ProductStatus = 'Còn hàng' | 'Sắp hết hàng' | 'Hết hàng';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

export interface Product {
  id: string; name: string; brand: string; category: string; price: number; originalPrice?: number;
  image: string; images: string[]; rating: number; reviewCount: number; sold: number;
  isNew?: boolean; isFeatured?: boolean; status: ProductStatus; warrantyMonths: number; description: string;
  specs: { cpu: string; ram: string; ssd: string; gpu: string; display: string };
}
export interface Category { id: string; name: string; icon: string; color: string; background: string }
export interface PromotionBanner { id: string; eyebrow: string; title: string; subtitle: string; cta: string; image: ImageSource; textColor: 'light' | 'dark' }
export interface CartItem { product: Product; quantity: number; selected: boolean }
export interface Address { id: string; recipient: string; phone: string; detail: string; isDefault: boolean }
export interface OrderItem { product: Product; quantity: number; price: number }
export interface Order { id: string; code: string; status: OrderStatus; createdAt: string; total: number; items: OrderItem[]; address: string; payment: string }
export interface Review { id: string; author: string; rating: number; content: string; createdAt: string }
