import { useMemo, useState } from 'react'
import { Download, Filter, Info, Search, SlidersHorizontal } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { DataTable } from '../components/common/DataTable'
import { Modal } from '../components/common/Modal'
import { PageHeader } from '../components/common/PageHeader'
import { managementConfigs } from '../services/mock-management'
import type { ManagementRow } from '../types/admin'

export function ManagementPage() {
  const { pathname } = useLocation()
  const config = managementConfigs[pathname]
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(config?.filters[0] ?? '')
  const [modal, setModal] = useState<'create' | 'detail' | 'actions' | null>(null)
  const [selected, setSelected] = useState<ManagementRow | null>(null)
  const [notice, setNotice] = useState('')
  const rows = useMemo(() => config?.rows.filter((row) => Object.values(row).some((value) => String(value).toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')))) ?? [], [config, query])
  if (!config) return null
  const open = (type: 'detail' | 'actions', row: ManagementRow) => { setSelected(row); setModal(type) }
  const demoAction = (message: string) => { setModal(null); setNotice(`${message}. Thay đổi chỉ được mô phỏng trên giao diện, chưa gửi đến máy chủ.`); window.setTimeout(() => setNotice(''), 4500) }

  return <>
    <PageHeader eyebrow={config.eyebrow} title={config.title} description={config.description} action={config.addLabel} onAction={() => setModal('create')} />
    {config.stats && <div className="mini-stats">{config.stats.map((stat) => <article key={stat.label} className={`mini-stat tone-${stat.tone}`}><span>{stat.label}</span><strong>{stat.value}</strong><small>{stat.note}</small></article>)}</div>}
    <section className="panel management-panel">
      <div className="table-toolbar"><label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.searchPlaceholder} /></label><div className="toolbar-actions"><label className="filter-select"><Filter size={15} /><select value={filter} onChange={(event) => setFilter(event.target.value)}>{config.filters.map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-secondary"><SlidersHorizontal size={16} />Bộ lọc</button><button className="button button-secondary"><Download size={16} />Xuất file</button></div></div>
      {rows.length ? <DataTable columns={config.columns} rows={rows} onRowClick={(row) => open('detail', row)} onMore={(row) => open('actions', row)} /> : <div className="empty-state"><Search size={28} /><h3>Không tìm thấy kết quả</h3><p>Thử thay đổi từ khóa hoặc bộ lọc đang chọn.</p></div>}
    </section>
    {notice && <div className="toast"><Info size={18} /><div><strong>Chế độ dữ liệu mẫu</strong><span>{notice}</span></div></div>}
    {modal === 'create' && <Modal title={config.addLabel} description="Biểu mẫu dùng thử — dữ liệu chưa được kết nối backend." onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Hủy</Button><Button onClick={() => demoAction(`Đã mô phỏng tạo ${config.entityName}`)}>Lưu bản demo</Button></>}><DemoForm entity={config.entityName} /></Modal>}
    {modal === 'detail' && selected && <Modal title={`Chi tiết ${config.entityName}`} description={`Mã tham chiếu: ${selected.id}`} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Đóng</Button><Button onClick={() => setModal('actions')}>Chỉnh sửa</Button></>}><div className="detail-grid">{config.columns.map((column) => <div key={column.key}><span>{column.label}</span><strong>{String(selected[column.key] ?? '—')}</strong></div>)}</div></Modal>}
    {modal === 'actions' && selected && <Modal title={`Thao tác ${config.entityName}`} description="Các thay đổi bên dưới chỉ áp dụng cho bản demo hiện tại." onClose={() => setModal(null)} footer={<Button variant="secondary" onClick={() => setModal(null)}>Đóng</Button>}><div className="action-list"><button onClick={() => demoAction(`Đã mô phỏng cập nhật ${config.entityName}`)}>Chỉnh sửa thông tin<span>Mở biểu mẫu cập nhật bản ghi đã chọn</span></button><button onClick={() => demoAction('Đã mô phỏng thay đổi trạng thái')}>Thay đổi trạng thái<span>Ẩn, hiện hoặc cập nhật trạng thái xử lý</span></button><button className="danger-action" onClick={() => { if (window.confirm('Bạn chắc chắn muốn mô phỏng thao tác này?')) demoAction('Đã xác nhận thao tác quan trọng') }}>Thao tác quan trọng<span>Yêu cầu xác nhận trước khi thực hiện</span></button></div></Modal>}
  </>
}

function DemoForm({ entity }: { entity: string }) {
  return <div className="form-grid"><label><span>Tên / Tiêu đề</span><input placeholder={`Nhập thông tin ${entity}`} /></label><label><span>Trạng thái</span><select><option>Đang hoạt động</option><option>Nháp</option><option>Đã ẩn</option></select></label><label className="full"><span>Mô tả</span><textarea rows={4} placeholder="Nhập mô tả chi tiết..." /></label><div className="demo-note full"><Info size={17} /><p><strong>Đang dùng dữ liệu mẫu.</strong> API sẽ được kết nối khi backend cung cấp endpoint chính thức.</p></div></div>
}
