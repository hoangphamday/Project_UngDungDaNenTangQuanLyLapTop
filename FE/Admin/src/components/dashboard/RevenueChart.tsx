import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { RevenuePoint } from '../../types/dashboard'

interface RevenueTooltipProps { active?: boolean; payload?: Array<{ value: number }>; label?: string }
function RevenueTooltip({ active, payload, label }: RevenueTooltipProps) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><p>Tháng {label?.replace('T','')}</p><strong>{payload[0].value} triệu</strong></div>
}
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return <section className="panel"><div className="panel-header"><div><h2 className="panel-title">Biểu đồ doanh thu</h2><p className="panel-subtitle">Tổng quan doanh thu theo tháng</p></div><select className="select-control" defaultValue="2026" aria-label="Chọn năm"><option>2026</option><option>2025</option></select></div><div className="chart-body"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 0 }}><defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#edf0f4" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 10 }} dy={8} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#98a2b3', fontSize: 10 }} tickFormatter={(value: number) => `${value}tr`} /><Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#c7d2fe', strokeDasharray: '4 4' }} /><Area type="monotone" dataKey="revenue" stroke="#5b5ce2" strokeWidth={2.5} fill="url(#revenueFill)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff', fill: '#5b5ce2' }} /></AreaChart></ResponsiveContainer></div></section>
}
