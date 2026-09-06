import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { Topbar } from '@/components/navigation/Topbar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar />
        <main className="px-4 md:px-6 py-6 pb-20 md:pb-6 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
