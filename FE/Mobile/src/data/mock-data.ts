import type { Address, Category, Order, Product, PromotionBanner, Review } from '@/types';

const image = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const laptopImages = [
  image('photo-1496181133206-80ce9b88a853'), image('photo-1517336714731-489689fd1ca8'),
  image('photo-1593642632823-8f785ba67e45'), image('photo-1588872657578-7efd1f1555ed'),
  image('photo-1593642702821-c8da6771f0c6'), image('photo-1484788984921-03950022c9ef'),
];

const createProduct = (value: Partial<Product> & Pick<Product, 'id' | 'name' | 'brand' | 'category' | 'price'>, index: number): Product => ({
  image: laptopImages[index % laptopImages.length],
  images: [laptopImages[index % laptopImages.length], laptopImages[(index + 1) % laptopImages.length], laptopImages[(index + 2) % laptopImages.length]],
  rating: 4.8, reviewCount: 128 + index * 17, sold: 520 + index * 113, status: 'Còn hàng',
  warrantyMonths: 24,
  description: 'Thiết kế cao cấp, hiệu năng ổn định và tối ưu cho nhu cầu học tập, làm việc lẫn giải trí. Máy được kiểm tra kỹ trước khi giao và bảo hành chính hãng toàn quốc.',
  specs: { cpu: 'Intel Core i7-13620H', ram: '16GB DDR5', ssd: '512GB NVMe', gpu: 'NVIDIA RTX 4050 6GB', display: '15.6” FHD 144Hz' },
  ...value,
});

export const products: Product[] = [
  createProduct({ id: '1', name: 'ASUS ROG Strix G16 G614', brand: 'ASUS', category: 'Gaming', price: 32990000, originalPrice: 36990000, isFeatured: true }, 0),
  createProduct({ id: '2', name: 'MacBook Air 13 M3 16GB', brand: 'Apple', category: 'MacBook', price: 26990000, originalPrice: 29990000, isNew: true, specs: { cpu: 'Apple M3 8-core', ram: '16GB Unified', ssd: '256GB SSD', gpu: 'GPU 10-core', display: '13.6” Liquid Retina' } }, 1),
  createProduct({ id: '3', name: 'Dell Inspiron 15 3530', brand: 'Dell', category: 'Văn phòng', price: 16990000, originalPrice: 18990000, isFeatured: true, specs: { cpu: 'Intel Core i5-1334U', ram: '16GB DDR4', ssd: '512GB NVMe', gpu: 'Intel Iris Xe', display: '15.6” FHD 120Hz' } }, 2),
  createProduct({ id: '4', name: 'Lenovo LOQ 15IRX9', brand: 'Lenovo', category: 'Gaming', price: 24990000, originalPrice: 27990000, specs: { cpu: 'Intel Core i7-13650HX', ram: '24GB DDR5', ssd: '512GB NVMe', gpu: 'NVIDIA RTX 4050 6GB', display: '15.6” FHD 144Hz' } }, 3),
  createProduct({ id: '5', name: 'Acer Swift Go 14 OLED', brand: 'Acer', category: 'Sinh viên', price: 20990000, originalPrice: 22990000, isNew: true, specs: { cpu: 'Intel Core Ultra 5', ram: '16GB LPDDR5X', ssd: '512GB NVMe', gpu: 'Intel Arc Graphics', display: '14” OLED 2.8K' } }, 4),
  createProduct({ id: '6', name: 'HP Pavilion Plus 14', brand: 'HP', category: 'Đồ họa', price: 23990000, originalPrice: 25990000, specs: { cpu: 'Intel Core Ultra 7', ram: '16GB LPDDR5X', ssd: '1TB NVMe', gpu: 'Intel Arc Graphics', display: '14” OLED 2.8K 120Hz' } }, 5),
  createProduct({ id: '7', name: 'MSI Katana 15 B13V', brand: 'MSI', category: 'Gaming', price: 28990000, originalPrice: 32990000, status: 'Sắp hết hàng' }, 0),
  createProduct({ id: '8', name: 'ASUS Vivobook 15 OLED', brand: 'ASUS', category: 'Văn phòng', price: 18490000, originalPrice: 20490000, specs: { cpu: 'Intel Core i5-13500H', ram: '16GB DDR4', ssd: '512GB NVMe', gpu: 'Intel Iris Xe', display: '15.6” OLED FHD' } }, 2),
  createProduct({ id: '9', name: 'MacBook Pro 14 M4', brand: 'Apple', category: 'Đồ họa', price: 39990000, originalPrice: 41990000, isNew: true, specs: { cpu: 'Apple M4 10-core', ram: '16GB Unified', ssd: '512GB SSD', gpu: 'GPU 10-core', display: '14.2” Liquid Retina XDR' } }, 1),
  createProduct({ id: '10', name: 'Dell Latitude 5450', brand: 'Dell', category: 'Văn phòng', price: 28990000, isFeatured: true, specs: { cpu: 'Intel Core Ultra 5', ram: '16GB DDR5', ssd: '512GB NVMe', gpu: 'Intel Graphics', display: '14” FHD+ IPS' } }, 4),
];

export const categories: Category[] = [
  { id: 'gaming', name: 'Gaming', icon: 'flash', color: '#6D3CE7', background: '#F0EAFF' },
  { id: 'office', name: 'Văn phòng', icon: 'receipt', color: '#1246D8', background: '#EAF0FF' },
  { id: 'student', name: 'Sinh viên', icon: 'user', color: '#079455', background: '#EAF8F1' },
  { id: 'creator', name: 'Đồ họa', icon: 'camera', color: '#D92D20', background: '#FFF0F0' },
  { id: 'macbook', name: 'MacBook', icon: 'laptop', color: '#344054', background: '#EEF2F6' },
];

export const banners: PromotionBanner[] = [
  { id: 'gaming', eyebrow: 'TUẦN LỄ GAMING', title: 'Bứt phá mọi\nkhung hình', subtitle: 'Giảm đến 20% laptop RTX 40 Series', cta: 'Khám phá ngay', image: require('../../assets/images/lapzone/banner-gaming.png'), textColor: 'light' },
  { id: 'student', eyebrow: 'BACK TO SCHOOL', title: 'Nhẹ hành trang\nMạnh hiệu năng', subtitle: 'Ưu đãi sinh viên đến 3 triệu đồng', cta: 'Xem ưu đãi', image: require('../../assets/images/lapzone/banner-student.png'), textColor: 'dark' },
  { id: 'creator', eyebrow: 'CREATOR STUDIO', title: 'Sáng tạo không\ngiới hạn', subtitle: 'Màn hình chuẩn màu, hiệu năng AI', cta: 'Chọn máy ngay', image: require('../../assets/images/lapzone/banner-creator.png'), textColor: 'light' },
];

export const brands = ['ASUS', 'Apple', 'Dell', 'Lenovo', 'Acer', 'HP', 'MSI'];

export const addresses: Address[] = [
  { id: 'a1', recipient: 'Nguyễn Văn An', phone: '090 123 4567', detail: '25 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh', isDefault: true },
  { id: 'a2', recipient: 'Nguyễn Văn An', phone: '090 123 4567', detail: '18 Võ Văn Ngân, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh', isDefault: false },
];

export const initialOrders: Order[] = [
  { id: 'o1', code: 'LZ26091801', status: 'SHIPPING', createdAt: '18/09/2026 · 09:35', total: 27480000, items: [{ product: products[1], quantity: 1, price: products[1].price }], address: addresses[0].detail, payment: 'Thanh toán khi nhận hàng' },
  { id: 'o2', code: 'LZ26090214', status: 'DELIVERED', createdAt: '02/09/2026 · 14:20', total: 17990000, items: [{ product: products[2], quantity: 1, price: products[2].price }], address: addresses[1].detail, payment: 'VNPay' },
  { id: 'o3', code: 'LZ26082509', status: 'CANCELLED', createdAt: '25/08/2026 · 20:05', total: 24990000, items: [{ product: products[3], quantity: 1, price: products[3].price }], address: addresses[0].detail, payment: 'Chuyển khoản ngân hàng' },
];

export const reviews: Review[] = [
  { id: 'r1', author: 'Minh Tuấn', rating: 5, content: 'Máy đẹp, đóng gói kỹ. Hiệu năng chơi game rất ổn và tư vấn nhiệt tình.', createdAt: '12/09/2026' },
  { id: 'r2', author: 'Thanh Hương', rating: 4, content: 'Màn hình đẹp, máy chạy mượt. Giao hàng nhanh hơn dự kiến.', createdAt: '08/09/2026' },
];

export const userProfile = {
  fullName: 'Nguyễn Văn An', username: 'nguyenvanan', phone: '0901234567',
  email: 'nguyenvanan@gmail.com', birthday: '10/05/2002', gender: 'Nam', points: 1250,
};

export const initialNotifications = [
  { id: 'n1', type: 'order', title: 'Đơn hàng đang được giao', message: 'Đơn #LZ26091801 đang trên đường giao đến bạn.', time: '10 phút trước', read: false },
  { id: 'n2', type: 'promotion', title: 'Flash Sale Gaming', message: 'Giảm đến 20% laptop RTX 40 Series, chỉ còn hôm nay.', time: '2 giờ trước', read: false },
  { id: 'n3', type: 'order', title: 'Đơn hàng đã xác nhận', message: 'LapZone đã xác nhận đơn hàng của bạn.', time: 'Hôm qua', read: false },
  { id: 'n4', type: 'system', title: 'Chào mừng đến LapZone', message: 'Tài khoản của bạn đã được thiết lập thành công.', time: '12/09/2026', read: true },
];
