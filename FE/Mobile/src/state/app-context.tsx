import { initialOrders, products } from '@/data/mock-data';
import type { CartItem, Order, Product } from '@/types';
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';

interface PlaceOrderInput { address: string; payment: string; note?: string; discount?: number; shippingFee?: number }
interface AppContextValue {
  favorites: Set<string>; cart: CartItem[]; orders: Order[]; isAuthenticated: boolean;
  toast: string | null; cartCount: number; selectedTotal: number;
  toggleFavorite: (productId: string) => void; addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void; toggleCartItem: (productId: string) => void;
  toggleAllCart: () => void; removeFromCart: (productId: string) => void; placeOrder: (input: PlaceOrderInput) => Order | null;
  cancelOrder: (orderId: string) => void; login: () => void; logout: () => void; notify: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState(() => new Set(['2', '4']));
  const [cart, setCart] = useState<CartItem[]>([
    { product: products[0], quantity: 1, selected: true },
    { product: products[4], quantity: 1, selected: true },
  ]);
  const [orders, setOrders] = useState(initialOrders);
  const [isAuthenticated, setAuthenticated] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      const removing = next.has(productId);
      if (removing) next.delete(productId); else next.add(productId);
      notify(removing ? 'Đã bỏ khỏi danh sách yêu thích' : 'Đã lưu vào danh sách yêu thích');
      return next;
    });
  }, [notify]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      return existing
        ? current.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, 10) } : item)
        : [...current, { product, quantity, selected: true }];
    });
    notify('Đã thêm sản phẩm vào giỏ hàng');
  }, [notify]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((current) => current.map((item) => item.product.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, 10)) } : item));
  }, []);
  const toggleCartItem = useCallback((productId: string) => setCart((current) => current.map((item) => item.product.id === productId ? { ...item, selected: !item.selected } : item)), []);
  const toggleAllCart = useCallback(() => setCart((current) => {
    const selectAll = current.some((item) => !item.selected);
    return current.map((item) => ({ ...item, selected: selectAll }));
  }), []);
  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
    notify('Đã xóa sản phẩm khỏi giỏ hàng');
  }, [notify]);

  const placeOrder = useCallback((input: PlaceOrderInput) => {
    const selected = cart.filter((item) => item.selected);
    if (!selected.length) return null;
    const subtotal = selected.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = Math.max(0, subtotal + (input.shippingFee ?? 0) - (input.discount ?? 0));
    const order: Order = {
      id: `o${Date.now()}`, code: `LZ${String(Date.now()).slice(-10)}`, status: 'PENDING',
      createdAt: new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date()),
      total, items: selected.map((item) => ({ product: item.product, quantity: item.quantity, price: item.product.price })),
      address: input.address, payment: input.payment,
    };
    setOrders((current) => [order, ...current]);
    setCart((current) => current.filter((item) => !item.selected));
    notify('Đặt hàng thành công');
    return order;
  }, [cart, notify]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: 'CANCELLED' } : order));
    notify('Đơn hàng đã được hủy');
  }, [notify]);

  const value = useMemo<AppContextValue>(() => ({
    favorites, cart, orders, isAuthenticated, toast,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    selectedTotal: cart.filter((item) => item.selected).reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    toggleFavorite, addToCart, updateQuantity, toggleCartItem, toggleAllCart, removeFromCart, placeOrder, cancelOrder,
    login: () => { setAuthenticated(true); notify('Đăng nhập thành công'); },
    logout: () => { setAuthenticated(false); notify('Đã đăng xuất'); }, notify,
  }), [favorites, cart, orders, isAuthenticated, toast, toggleFavorite, addToCart, updateQuantity, toggleCartItem, toggleAllCart, removeFromCart, placeOrder, cancelOrder, notify]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp phải được dùng bên trong AppProvider');
  return value;
}
