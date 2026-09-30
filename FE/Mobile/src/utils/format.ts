export const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
export const discountPercent = (price: number, originalPrice?: number) => !originalPrice || originalPrice <= price ? 0 : Math.round(((originalPrice - price) / originalPrice) * 100);
export const orderStatusLabel = (status: string) => ({ PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', PROCESSING: 'Đang chuẩn bị', SHIPPING: 'Đang giao', DELIVERED: 'Đã giao', CANCELLED: 'Đã hủy' }[status] ?? status);
