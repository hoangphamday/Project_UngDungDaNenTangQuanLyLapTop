import { API_BASE_URL, apiRequest } from './api-client';
import type { Product, ProductVariant } from '@/types';
type Row = Record<string, any>;
const imageUrl = (value?: string | null) => value ? (/^https?:\/\//i.test(value) ? value : `${new URL(API_BASE_URL).origin}/${value.replace(/^\/+/, '')}`) : '';
export const mapVariant = (v: Row): ProductVariant => ({
  id: String(v.id), sku: v.ma_sku, color: v.mau_sac, ramGb: Number(v.ram_gb), ssdGb: Number(v.ssd_gb),
  price: Number(v.gia_khuyen_mai ?? v.gia_ban), originalPrice: v.gia_khuyen_mai == null ? undefined : Number(v.gia_ban),
  stock: Number(v.tonKho ?? 0), image: imageUrl(v.anh_dai_dien) || undefined,
});
export function mapProduct(l: Row): Product {
  const mappedVariants = (l.variants || []).map(mapVariant);
  const cheapest = [...mappedVariants].sort((a, b) => a.price - b.price)[0];
  const image = imageUrl(l.anh_dai_dien) || cheapest?.image || '';
  const createdAt = l.created_at ? new Date(l.created_at).getTime() : 0;
  return {
    id: String(l.id), name: l.ten_san_pham, brand: l.tenHang || '', category: l.tenDanhMuc || '',
    price: cheapest?.price ?? Number(l.gia_khuyen_mai ?? l.gia_ban), originalPrice: cheapest?.originalPrice ?? (l.gia_khuyen_mai == null ? undefined : Number(l.gia_ban)),
    image, images: l.images?.length ? l.images.map((i: Row) => imageUrl(i.imageUrl)) : [image],
    rating: 0, reviewCount: 0, sold: 0, isNew: createdAt > Date.now() - 14 * 86400000,
    status: Number(l.tonKho) > 0 ? 'Còn hàng' : 'Hết hàng', warrantyMonths: l.bao_hanh_thang,
    description: l.mo_ta || '',
    specs: { cpu:l.cpu || '',ram:`${l.ram_gb} GB`,ssd:`${l.ssd_gb} GB`,gpu:l.gpu || '',display:l.man_hinh_inch ? `${l.man_hinh_inch} inch` : '' },
    variants: mappedVariants,
  };
}
export const cartKey = (p: Product) => `${p.id}:${p.selectedVariant?.id || 'default'}`;
export function withVariant(p: Product, v: ProductVariant): Product {
  return {...p,selectedVariant:v,price:v.price,originalPrice:v.originalPrice,image:v.image || p.image,
    status:v.stock>0?'Còn hàng':'Hết hàng',specs:{...p.specs,ram:`${v.ramGb} GB`,ssd:`${v.ssdGb} GB`}};
}
export const catalogService = {
  async getCategories(): Promise<{ id: string; name: string }[]> {
    const response = await apiRequest<{ data: { id: number; ten_danh_muc: string }[] }>('/categories');
    return response.data.map((row) => ({ id: String(row.id), name: row.ten_danh_muc }));
  },
  async getBrands(): Promise<{ id: string; name: string }[]> {
    const response = await apiRequest<{ data: { id: number; ten_hang: string }[] }>('/brands');
    return response.data.map((row) => ({ id: String(row.id), name: row.ten_hang }));
  },
  async getProducts(): Promise<Product[]> {
    const rows: Product[]=[];
    for(let page=1;;page++) {
      const res=await apiRequest<{data:{items:Row[];pagination:{totalPages:number}}}>(`/laptops?limit=100&page=${page}`);
      rows.push(...res.data.items.map(mapProduct));
      if(page>=res.data.pagination.totalPages) return rows;
    }
  },
  async getProductById(id: string): Promise<Product | undefined> {
    const res=await apiRequest<{data:Row}>(`/laptops/${id}`);
    return mapProduct(res.data);
  },
};
