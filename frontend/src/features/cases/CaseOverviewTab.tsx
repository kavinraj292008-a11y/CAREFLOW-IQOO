import { useCaseStore } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, stressTone } from '@/components/ui/Badge'
import { formatINR, stressLabel } from '@/utils/format'
import { normalizeStress, periodLabel } from '@/utils/adapters'
import { Link } from 'react-router-dom'

export function CaseOverviewTab() {
  const { caseData } = useCaseStore()
  const { result } = useRepaymentStore()

  if (!caseData) return null

  const monthlyIncome = caseData.income / 12
  const status = result?.careflow.optimization_status ?? 'pending'

  const worstStress = result?.careflow.schedule.reduce((worst, p) => {
    const order = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    return order.indexOf(p.stress_level) > order.indexOf(worst) ? p.stress_level : worst
  }, 'LOW') ?? 'LOW'

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Treatment summary" />
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Treatment periods</dt>
              <dd className="text-text-primary">{caseData.treatment_costs.length} months</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Peak treatment cost</dt>
              <dd className="text-stress-coral tabular-nums">{formatINR(Math.max(...caseData.treatment_costs))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Total treatment cost</dt>
              <dd className="text-text-primary tabular-nums">{formatINR(caseData.treatment_costs.reduce((a, b) => a + b, 0))}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Next expected expense</dt>
              <dd className="text-text-primary tabular-nums">
                {formatINR(caseData.treatment_costs[1] ?? caseData.treatment_costs[0])}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Financial summary" />
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Loan principal</dt>
              <dd className="text-text-primary tabular-nums">{formatINR(caseData.loan.principal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Monthly income</dt>
              <dd className="text-text-primary tabular-nums">{formatINR(monthlyIncome)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Household expenses</dt>
              <dd className="text-text-primary tabular-nums">{formatINR(caseData.monthly_household_expenses)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Projected stress (CareFlow)</dt>
              <dd>
                <Badge tone={stressTone(normalizeStress(worstStress as 'LOW'|'MODERATE'|'HIGH'|'CRITICAL'))}>
                  {stressLabel[normalizeStress(worstStress as 'LOW'|'MODERATE'|'HIGH'|'CRITICAL')]}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card elevated>
        <CardHeader title="Optimization status" />
        <div className="flex items-center gap-3 mb-3">
          <Badge tone={status === 'infeasible' ? 'coral' : status === 'pending' ? 'amber' : 'teal'}>
            {status === 'pending' ? 'Not yet run' : status}
          </Badge>
          {result && (
            <span className="text-[13px] text-text-secondary">
              {result.careflow.metrics.extension_periods} extension periods ·{' '}
              Peak deficit: {formatINR(result.careflow.metrics.peak_deficit)}
            </span>
          )}
        </div>
        <div className="flex gap-4">
          <Link to="/app/repayment" className="text-[13px] text-accent-tealLight hover:underline">
            Repayment optimizer →
          </Link>
          <Link to="/app/simulation" className="text-[13px] text-accent-tealLight hover:underline">
            Simulation →
          </Link>
        </div>
      </Card>
    </div>
  )
}
