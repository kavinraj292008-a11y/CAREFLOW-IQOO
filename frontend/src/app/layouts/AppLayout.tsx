import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { Topbar } from '@/components/navigation/Topbar'
import { AssistantPanel } from '@/features/assistant/AssistantPanel'

const titleMap: Record<string, string> = {
  '/app': 'Overview',
  '/app/cases': 'Cases',
  '/app/treatment': 'Treatment',
  '/app/cashflow': 'Cashflow',
  '/app/repayment': 'Repayment',
  '/app/simulation': 'Simulation',
  '/app/lender': 'Lender View',
}

export function AppLayout() {
  const location = useLocation()
  const title = titleMap[location.pathname] ?? 'CareFlow'

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} />
        <main className="px-4 md:px-6 py-6 pb-20 md:pb-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <AssistantPanel />
    </div>
  )
}
