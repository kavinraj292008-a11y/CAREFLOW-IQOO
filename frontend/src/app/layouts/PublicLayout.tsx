import { Outlet, Link } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-[15px] font-semibold text-text-primary tracking-tight">
            CareFlow
          </Link>
          <Link
            to="/app"
            className="text-[13px] font-semibold bg-accent-teal text-bg-primary px-4 py-2 rounded-sm hover:bg-accent-tealLight transition-colors"
          >
            Explore Demo
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
