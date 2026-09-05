import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import {
  LayoutGrid,
  FolderKanban,
  Activity,
  Wallet,
  RefreshCw,
  FlaskConical,
  Landmark,
  HelpCircle,
} from 'lucide-react'

const navItems = [
  { to: '/app', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/cases', label: 'Cases', icon: FolderKanban },
  { to: '/app/treatment', label: 'Treatment', icon: Activity },
  { to: '/app/cashflow', label: 'Cashflow', icon: Wallet },
  { to: '/app/repayment', label: 'Repayment', icon: RefreshCw },
  { to: '/app/simulation', label: 'Simulation', icon: FlaskConical },
  { to: '/app/lender', label: 'Lender View', icon: Landmark },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-border bg-bg-secondary h-screen sticky top-0">
      <div className="h-14 flex items-center px-4 border-b border-border">
        <span className="text-[15px] font-semibold tracking-tight text-text-primary">CareFlow</span>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-white/[0.06] text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]',
              )
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-2 space-y-0.5">
        <button className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.03]">
          <HelpCircle size={16} strokeWidth={1.75} />
          Help
        </button>
        <div className="px-2.5 py-2">
          <p className="text-[11px] text-text-muted">Demo Environment</p>
          <p className="text-[12px] text-text-secondary mt-0.5">R. Iyer · Reviewer</p>
        </div>
      </div>
    </aside>
  )
}
