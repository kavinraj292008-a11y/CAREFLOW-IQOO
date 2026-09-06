import { Search } from 'lucide-react'

export function Topbar() {
  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 md:px-6 sticky top-0 bg-bg-primary/95 backdrop-blur-sm z-20">
      <div className="md:hidden text-[15px] font-semibold text-text-primary">CareFlow</div>
      <div className="hidden md:block text-[13px] text-text-secondary">CareFlow Financial Engine</div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-surface border border-border rounded-sm px-3 py-1.5 w-56">
          <Search size={14} className="text-text-muted" />
          <input
            placeholder="Search cases..."
            className="bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none w-full"
          />
        </div>
        <div className="w-7 h-7 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-[11px] text-text-secondary font-medium">
          CF
        </div>
      </div>
    </header>
  )
}
