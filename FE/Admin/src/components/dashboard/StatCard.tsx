import { ArrowDownRight, ArrowUpRight, CircleDollarSign, Laptop, ShoppingBag, Users } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { DashboardStat } from '../../types/dashboard'

const visuals = {
  indigo: { icon: CircleDollarSign, accent: '#5b5ce2', tint: '#eef2ff' }, green: { icon: ShoppingBag, accent: '#12a06a', tint: '#eafaf3' },
  orange: { icon: Users, accent: '#e58a17', tint: '#fff6e8' }, blue: { icon: Laptop, accent: '#2684d9', tint: '#eaf6ff' },
}
export function StatCard({ stat }: { stat: DashboardStat }) {
  const visual = visuals[stat.tone]; const Icon = visual.icon; const isPositive = stat.change >= 0; const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight
  return <article className="stat-card" style={{ '--accent': visual.accent, '--tint': visual.tint } as CSSProperties}><div className="stat-top"><span className="stat-label">{stat.label}</span><span className="stat-icon"><Icon size={19} /></span></div><div className="stat-value">{stat.value}</div><div className="stat-footer"><span className={`stat-change${isPositive ? '' : ' negative'}`}><TrendIcon size={12} />{Math.abs(stat.change)}%</span><span>{stat.comparison}</span></div></article>
}
