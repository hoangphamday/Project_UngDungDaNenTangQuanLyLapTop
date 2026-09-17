import { Laptop } from 'lucide-react'
import type { LowStockProduct } from '../../types/dashboard'

export function LowStockList({ products }: { products: LowStockProduct[] }) {
  return <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Sắp hết hàng</h2><p className="panel-subtitle">Sản phẩm cần nhập thêm</p></div><button className="panel-action" type="button">Xem tất cả</button></div><div className="stock-list">{products.map((product) => <div className="stock-item" key={product.id}><div className="product-thumb"><Laptop size={20} strokeWidth={1.5} /></div><div style={{ minWidth: 0 }}><div className="stock-name">{product.name}</div><div className="stock-sku">{product.sku}</div></div><div className="stock-count"><strong>{product.stock}</strong><span>sản phẩm</span></div></div>)}</div></section>
}
