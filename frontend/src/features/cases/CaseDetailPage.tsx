import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCaseStore } from '@/stores/caseStore'
import { Tabs } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatINR } from '@/utils/format'
import { CaseOverviewTab } from './CaseOverviewTab'
import { CaseTreatmentTab } from './CaseTreatmentTab'
import { CaseCashflowTab } from './CaseCashflowTab'
import { CaseRepaymentTab } from './CaseRepaymentTab'
import { CaseSimulationTab } from './CaseSimulationTab'
import { CaseLenderTab } from './CaseLenderTab'
import { CaseActivityTab } from './CaseActivityTab'

const tabItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'treatment', label: 'Treatment' },
  { key: 'cashflow', label: 'Cashflow' },
  { key: 'repayment', label: 'Repayment' },
  { key: 'simulation', label: 'Simulation' },
  { key: 'lender', label: 'Lender Analysis' },
  { key: 'activity', label: 'Activity' },
]

const statusLabel: Record<string, string> = {
  stable: 'Stable',
  review: 'Under Review',
  replan: 'Replan Pending',
  closed: 'Closed',
}

export function CaseDetailPage() {
  const { caseId = '' } = useParams()
  const { activeCase, loadCase } = useCaseStore()
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    loadCase(caseId)
    setTab('overview')
  }, [caseId, loadCase])

  if (!activeCase) {
    return <p className="text-[13px] text-text-secondary">Loading case…</p>
  }

  const c = activeCase

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-semibold text-text-primary">Case {c.id}</h1>
            <Badge tone="muted">{statusLabel[c.status]}</Badge>
          </div>
          <p className="text-[13px] text-text-secondary mt-1">{c.patientLabel}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-2 text-[13px]">
          <div>
            <p className="text-text-muted">Outstanding loan</p>
            <p className="text-text-primary tabular-nums mt-0.5">{formatINR(c.loan.outstandingPrincipal)}</p>
          </div>
          <div>
            <p className="text-text-muted">Monthly income</p>
            <p className="text-text-primary tabular-nums mt-0.5">{formatINR(c.financial.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-text-muted">Household expenses</p>
            <p className="text-text-primary tabular-nums mt-0.5">{formatINR(c.financial.monthlyHouseholdExpenses)}</p>
          </div>
          <div>
            <p className="text-text-muted">Remaining tenure</p>
            <p className="text-text-primary tabular-nums mt-0.5">{c.loan.remainingTenureMonths} months</p>
          </div>
        </div>
      </div>

      <Tabs items={tabItems} active={tab} onChange={setTab} />

      <div>
        {tab === 'overview' && <CaseOverviewTab c={c} />}
        {tab === 'treatment' && <CaseTreatmentTab caseId={c.id} />}
        {tab === 'cashflow' && <CaseCashflowTab caseId={c.id} />}
        {tab === 'repayment' && <CaseRepaymentTab caseId={c.id} />}
        {tab === 'simulation' && <CaseSimulationTab />}
        {tab === 'lender' && <CaseLenderTab caseId={c.id} />}
        {tab === 'activity' && <CaseActivityTab caseId={c.id} />}
      </div>
    </div>
  )
}
