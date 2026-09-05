import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { LayoutGrid, FolderKanban, Activity, Wallet, RefreshCw } from 'lucide-react'

const items = [
  { to: '/app', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/cases', label: 'Cases', icon: FolderKanban },
  { to: '/app/treatment', label: 'Treatment', icon: Activity },
  { to: '/app/cashflow', label: 'Cashflow', icon: Wallet },
  { to: '/app/repayment', label: 'Repay', icon: RefreshCw },
]

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-bg-secondary border-t border-border flex items-stretch">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium',
              isActive ? 'text-accent-tealLight' : 'text-text-muted',
            )
          }
        >
          <Icon size={18} strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
