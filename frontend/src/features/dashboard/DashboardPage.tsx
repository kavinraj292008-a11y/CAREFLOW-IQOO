import { useEffect } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { casesApi } from '@/services/api'
import { useState } from 'react'
import type { PortfolioMetrics, PortfolioStressPoint } from '@/types'
import { MetricStat } from '@/components/ui/MetricStat'
import { Card, CardHeader } from '@/components/ui/Card'
import { DemoDataBadge } from '@/components/feedback/DemoDataBadge'
import { PortfolioStressChart } from '@/components/charts/PortfolioStressChart'
import { CasesTable } from '@/components/tables/CasesTable'

export function DashboardPage() {
  const { cases, loadCases } = useCaseStore()
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null)
  const [stress, setStress] = useState<PortfolioStressPoint[]>([])

  useEffect(() => {
    loadCases()
    casesApi.getPortfolioMetrics().then(setMetrics)
    casesApi.getPortfolioStress().then(setStress)
  }, [loadCases])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">CareFlow Overview</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Monitor treatment-driven repayment stress and restructuring activity.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <DemoDataBadge />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStat label="Active cases" value={metrics ? String(metrics.activeCases) : '—'} />
        <MetricStat label="Cases under review" value={metrics ? String(metrics.casesUnderReview) : '—'} />
        <MetricStat label="High-stress cases" value={metrics ? String(metrics.highStressCases) : '—'} />
        <MetricStat label="Active restructurings" value={metrics ? String(metrics.activeRestructurings) : '—'} />
      </div>

      <Card>
        <CardHeader
          title="Portfolio stress overview"
          subtitle="Projected repayment stress across the treatment horizon, traditional vs CareFlow."
        />
        <PortfolioStressChart data={stress} />
      </Card>

      <Card>
        <CardHeader title="Recent cases" subtitle="Cases most recently updated or flagged for review." />
        <CasesTable cases={cases.slice(0, 5)} />
      </Card>
    </div>
  )
}
