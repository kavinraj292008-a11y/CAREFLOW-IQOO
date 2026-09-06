import { useCaseStore } from '@/stores/caseStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { TreatmentCostChart } from '@/components/charts/TreatmentCostChart'
import { formatINR } from '@/utils/format'
import { periodLabel } from '@/utils/adapters'

export function CaseTreatmentTab() {
  const { caseData, caseName } = useCaseStore()
  if (!caseData) return null

  const chartData = caseData.treatment_costs.map((cost, i) => ({
    period: i + 1,
    label: periodLabel(i + 1),
    expectedCost: cost,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={caseName} subtitle={`${caseData.treatment_costs.length}-month illustrative synthetic treatment timeline`} />
        <TreatmentCostChart data={chartData} />
      </Card>
      <Card>
        <CardHeader title="Treatment periods" />
        <div className="flex flex-wrap gap-3">
          {chartData.map((phase, i) => (
            <div key={phase.period} className="flex items-center">
              <div className="panel px-4 py-3 min-w-[110px]">
                <p className="text-[11px] text-text-muted">{phase.label}</p>
                <p className="text-[15px] font-semibold text-text-primary mt-1 tabular-nums">{formatINR(phase.expectedCost)}</p>
              </div>
              {i < chartData.length - 1 && <span className="text-text-muted px-2">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
