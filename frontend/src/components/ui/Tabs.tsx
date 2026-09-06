import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

// Supports both href-based (NavLink) and key-based (button) usage
export function Tabs({
  tabs,
  items,
  active,
  onChange,
}: {
  tabs?: { label: string; href: string }[]
  items?: { key: string; label: string }[]
  active?: string
  onChange?: (key: string) => void
}) {
  if (tabs) {
    return (
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <NavLink
            key={tab.href}
            to={tab.href}
            end
            className={({ isActive }) =>
              cn(
                'px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-accent-teal text-text-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary',
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
      {(items ?? []).map((item) => (
        <button
          key={item.key}
          onClick={() => onChange?.(item.key)}
          className={cn(
            'px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
            active === item.key
              ? 'border-accent-teal text-text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary',
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
