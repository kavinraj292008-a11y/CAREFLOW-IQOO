import { useEffect } from 'react'
import { useParams, Link, Navigate, Outlet } from 'react-router-dom'
import { useCaseStore, DEMO_CASE_ID } from '@/stores/caseStore'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Loader2 } from 'lucide-react'

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Treatment', path: 'treatment' },
  { label: 'Cashflow', path: 'cashflow' },
  { label: 'Repayment', path: 'repayment' },
  { label: 'Simulation', path: 'simulation' },
  { label: 'Lender', path: 'lender' },
]

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const { caseData, caseName, isLoading, loadDemoCase } = useCaseStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  // Only the canonical demo case exists
  if (caseId !== DEMO_CASE_ID) {
    return <Navigate to={`/app/cases/${DEMO_CASE_ID}`} replace />
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading case...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link to="/app/cases" className="text-[13px] text-text-muted hover:text-text-secondary">Cases</Link>
          <span className="text-text-muted">/</span>
          <span className="text-[13px] text-text-primary">{DEMO_CASE_ID}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-semibold text-text-primary">{caseName || 'Chemotherapy Demo — Canonical'}</h1>
          <Badge tone="teal" className="text-[11px]">Synthetic demo</Badge>
        </div>
      </div>

      <Tabs
        tabs={TABS.map((t) => ({
          label: t.label,
          href: `/app/cases/${DEMO_CASE_ID}${t.path ? '/' + t.path : ''}`,
        }))}
      />

      <Outlet />
    </div>
  )
}
