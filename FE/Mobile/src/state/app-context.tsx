import type { CartItem, Order, Product } from '@/types';
import { apiRequest } from '@/services/api-client';
import { cartKey } from '@/services/catalog.service';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

interface PlaceOrderInput { address: string; addressId?: string; delivery?: 'DELIVERY'|'PICKUP'; payment: string; note?: string; promotionCode?: string; discount?: number; shippingFee?: number }
interface AppContextValue {
  favorites: Set<string>; cart: CartItem[]; orders: Order[]; isAuthenticated: boolean; accessToken: string | null;
  toast: string | null; cartCount: number; selectedTotal: number;
  toggleFavorite: (productId: string) => void; addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void; toggleCartItem: (key: string) => void;
  toggleAllCart: () => void; removeFromCart: (key: string) => void; placeOrder: (input: PlaceOrderInput) => Promise<Order | null>;
  cancelOrder: (orderId: string) => void; login: (identity?: string, password?: string) => Promise<void>; logout: () => void; notify: (message: string) => void;
}
const AppContext = createContext<AppContextValue | null>(null);
type Row = Record<string, any>;
function mapOrder(row: Row, products: Product[] = [], address = ''): Order {
  return { id:String(row.id),code:row.ma_don_hang,status:row.trang_thai,createdAt:new Date(row.ngay_dat).toLocaleString('vi-VN'),total:Number(row.tong_thanh_toan),address,payment:row.phuongThucThanhToan || 'COD',
    items:(row.items || []).map((i:Row)=>{
      const config=typeof i.cau_hinh==='string'?JSON.parse(i.cau_hinh):i.cau_hinh || {};
      const old=products.find(p=>p.selectedVariant?.id===String(i.bien_the_id));
      const product:Product={id:String(i.laptop_id),name:i.ten_san_pham,brand:'',category:'',image:old?.image || '',images:[],price:Number(i.don_gia),rating:0,reviewCount:0,sold:0,status:'Còn hàng',description:'',warrantyMonths:12,
        specs:{cpu:'',ram:`${config.ramGb || ''} GB`,ssd:`${config.ssdGb || ''} GB`,gpu:'',display:''},selectedVariant:{id:String(i.bien_the_id),sku:config.maSku,color:config.mauSac,ramGb:config.ramGb,ssdGb:config.ssdGb,price:Number(i.don_gia),stock:0}};
      return {product,quantity:Number(i.so_luong),price:Number(i.don_gia)};
    }) };
}
export function AppProvider({ children }: PropsWithChildren) {
  const [favorites,setFavorites]=useState(()=>new Set<string>());
  const [cart,setCart]=useState<CartItem[]>([]);
  const [orders,setOrders]=useState<Order[]>([]);
  const [accessToken,setAccessToken]=useState<string|null>(null);
  const [toast,setToast]=useState<string|null>(null);
  const notify=useCallback((message:string)=>{setToast(message);setTimeout(()=>setToast(null),2400);},[]);
  const login=useCallback(async(identity?:string,password?:string)=>{
    if(!identity||!password) throw new Error('Vui lòng đăng nhập bằng tài khoản khách hàng');
    const response=await apiRequest<{data:{accessToken:string;taiKhoan:{vaiTro:string}}}>('/auth/login',{method:'POST',body:JSON.stringify({dinhDanh:identity,matKhau:password})});
    if(response.data.taiKhoan.vaiTro!=='CUSTOMER') throw new Error('Ứng dụng mua hàng cần tài khoản khách hàng. Tài khoản admin dùng ở trang quản trị.');
    setOrders([]);setFavorites(new Set());setAccessToken(response.data.accessToken);notify('Đăng nhập thành công');
  },[notify]);
  useEffect(()=>{
    if(!accessToken)return;
    let active=true;
    apiRequest<{data:{items:Row[]}}>('/orders?limit=100',{token:accessToken}).then(async res=>{
      const rows=await Promise.all(res.data.items.map(row=>apiRequest<{data:Row}>(`/orders/${row.id}`,{token:accessToken})));
      if(active)setOrders(rows.map(r=>mapOrder(r.data)));
    }).catch(e=>{if(active)notify(e.message);});
    return ()=>{active=false;};
  },[accessToken,notify]);
  useEffect(()=>{
    if(!accessToken)return;
    let active=true;
    apiRequest<{data:Row[]}>('/wishlist',{token:accessToken}).then(response=>{
      if(active)setFavorites(new Set(response.data.map(item=>String(item.id))));
    }).catch(error=>{if(active)notify(error.message);});
    return ()=>{active=false;};
  },[accessToken,notify]);
  const toggleFavorite=useCallback((id:string)=>{
    if(!accessToken){notify('Vui lòng đăng nhập để lưu sản phẩm yêu thích');return;}
    const saved=favorites.has(id);
    void apiRequest(`/wishlist/${id}`,{token:accessToken,method:saved?'DELETE':'POST'}).then(()=>{
      setFavorites(current=>{const next=new Set(current);if(saved)next.delete(id);else next.add(id);return next;});
    }).catch(error=>notify(error.message));
  },[accessToken,favorites,notify]);
  const addToCart=useCallback((product:Product,quantity=1)=>{
    if(!product.selectedVariant){notify('Vui lòng chọn cấu hình trên trang chi tiết laptop');return;}
    if(product.selectedVariant.stock<quantity){notify('Cấu hình đã chọn không đủ tồn kho');return;}
    setCart(current=>{
      const existing=current.find(i=>cartKey(i.product)===cartKey(product));
      const nextQuantity=(existing?.quantity || 0)+quantity;
      if(nextQuantity>product.selectedVariant!.stock){notify('Số lượng vượt quá tồn kho');return current;}
      notify('Đã thêm cấu hình vào giỏ hàng');
      return existing?current.map(i=>cartKey(i.product)===cartKey(product)?{...i,product,quantity:nextQuantity}:i):[...current,{product,quantity,selected:true}];
    });
  },[notify]);
  const updateQuantity=useCallback((key:string,quantity:number)=>setCart(current=>current.map(i=>cartKey(i.product)===key?{...i,quantity:Math.max(1,Math.min(quantity,i.product.selectedVariant?.stock || 1,99))}:i)),[]);
  const toggleCartItem=useCallback((key:string)=>setCart(current=>current.map(i=>cartKey(i.product)===key?{...i,selected:!i.selected}:i)),[]);
  const toggleAllCart=useCallback(()=>setCart(current=>{const selected=current.some(i=>!i.selected);return current.map(i=>({...i,selected}));}),[]);
  const removeFromCart=useCallback((key:string)=>setCart(current=>current.filter(i=>cartKey(i.product)!==key)),[]);
  const placeOrder=useCallback(async(input:PlaceOrderInput)=>{
    if(!accessToken)throw new Error('Vui lòng đăng nhập trước khi đặt hàng');
    const selected=cart.filter(i=>i.selected);
    if(!selected.length)return null;
    const response=await apiRequest<{data:Row}>('/orders',{token:accessToken,method:'POST',body:JSON.stringify({
      items:selected.map(i=>({laptopId:Number(i.product.id),bienTheId:Number(i.product.selectedVariant?.id),soLuong:i.quantity})),
      diaChiId:input.addressId?Number(input.addressId):undefined,phuongThucNhan:input.delivery || 'DELIVERY',phuongThucThanhToan:input.payment,
      maKhuyenMai:input.promotionCode || undefined,ghiChu:input.note,
    })});
    const order=mapOrder(response.data,selected.map(i=>i.product),input.address);
    const bought=new Set(selected.map(i=>cartKey(i.product)));
    setOrders(current=>[order,...current]);setCart(current=>current.filter(i=>!bought.has(cartKey(i.product))));notify('Đặt hàng thành công');return order;
  },[accessToken,cart,notify]);
  const cancelOrder=useCallback((id:string)=>{
    if(!accessToken)return;
    void apiRequest(`/orders/${id}/cancel`,{token:accessToken,method:'PATCH',body:JSON.stringify({lyDo:'Khách hàng hủy'})}).then(()=>{setOrders(current=>current.map(o=>o.id===id?{...o,status:'CANCELLED'}:o));notify('Đã hủy đơn hàng');}).catch(e=>notify(e.message));
  },[accessToken,notify]);
  const value=useMemo<AppContextValue>(()=>({favorites,cart,orders,accessToken,isAuthenticated:!!accessToken,toast,cartCount:cart.reduce((s,i)=>s+i.quantity,0),selectedTotal:cart.filter(i=>i.selected).reduce((s,i)=>s+i.product.price*i.quantity,0),toggleFavorite,addToCart,updateQuantity,toggleCartItem,toggleAllCart,removeFromCart,placeOrder,cancelOrder,login,logout:()=>{setAccessToken(null);setFavorites(new Set());setOrders([]);setCart([]);notify('Đã đăng xuất');},notify}),[favorites,cart,orders,accessToken,toast,toggleFavorite,addToCart,updateQuantity,toggleCartItem,toggleAllCart,removeFromCart,placeOrder,cancelOrder,login,notify]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp(){const value=useContext(AppContext);if(!value)throw new Error('useApp requires AppProvider');return value;}
