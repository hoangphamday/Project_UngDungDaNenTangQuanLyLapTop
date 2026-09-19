import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
export function NotFoundPage() { return <div className="empty-state not-found"><SearchX size={38} /><h1>Không tìm thấy trang</h1><p>Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.</p><Link className="button button-primary" to="/"><ArrowLeft size={16} />Về Dashboard</Link></div> }
