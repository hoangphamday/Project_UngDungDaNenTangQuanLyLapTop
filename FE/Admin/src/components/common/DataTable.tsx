import { ChevronLeft, ChevronRight, Laptop, MoreHorizontal, UserRound } from 'lucide-react'
import type { ManagementRow, TableColumn } from '../../types/admin'
import { formatCurrency, getInitials } from '../../utils/formatters'
import { StatusBadge } from './StatusBadge'

interface Props { columns: TableColumn[]; rows: ManagementRow[]; onRowClick: (row: ManagementRow) => void; onMore: (row: ManagementRow) => void }
export function DataTable({ columns, rows, onRowClick, onMore }: Props) {
  return <><div className="data-table-wrap"><table className="data-table"><thead><tr><th className="check-cell"><input type="checkbox" aria-label="Chọn tất cả" /></th>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th /></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.id} onClick={() => onRowClick(row)}><td className="check-cell" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Chọn ${row.id}`} /></td>{columns.map((column) => <td key={column.key}>{renderCell(column, row)}</td>)}<td className="action-cell"><button className="table-action" aria-label="Thao tác" onClick={(event) => { event.stopPropagation(); onMore(row) }}><MoreHorizontal size={18} /></button></td></tr>)}</tbody></table></div>
    <div className="pagination"><p>Hiển thị <strong>1–{rows.length}</strong> trong <strong>{Math.max(rows.length, 24)}</strong> kết quả</p><div><button disabled aria-label="Trang trước"><ChevronLeft size={16} /></button><button className="active">1</button><button>2</button><button>3</button><button aria-label="Trang sau"><ChevronRight size={16} /></button></div></div></>
}

function renderCell(column: TableColumn, row: ManagementRow) {
  const value = row[column.key]
  if (column.type === 'status') return <StatusBadge value={String(value)} />
  if (column.type === 'money') return <strong className="money">{formatCurrency(Number(value))}</strong>
  if (column.type === 'product') return <div className="entity-cell"><span className="entity-image"><Laptop size={22} /></span><div><strong>{value}</strong><span>{row.sku}</span></div></div>
  if (column.type === 'user') return <div className="entity-cell"><span className="table-avatar">{value ? getInitials(String(value)) : <UserRound size={16} />}</span><div><strong>{value}</strong>{row.secondary && <span>{row.secondary}</span>}</div></div>
  return <span className={column.key === 'code' ? 'link-value' : ''}>{value}</span>
}
