import type { Case } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatINR } from '@/utils/format'
import { Badge, stressTone } from '@/components/ui/Badge'
import { stressLabel } from '@/utils/format'

export function CaseOverviewTab({ c }: { c: Case }) {
  const availableCash =
    c.financial.monthlyIncome - c.financial.monthlyHouseholdExpenses - c.currentPayment

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Treatment summary" />
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Treatment</dt>
              <dd className="text-text-primary">{c.treatment.name.replace(' Demo', '')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Current phase</dt>
              <dd className="text-text-primary">{c.currentPhaseLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Next event</dt>
              <dd className="text-text-primary">Next projected cost review in 30 days</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Next expected expense</dt>
              <dd className="text-text-primary tabular-nums">
                {formatINR(c.treatment.phases[Math.min(2, c.treatment.phases.length - 1)]?.expectedCost ?? 0)}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Financial summary" />
          <dl className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Outstanding principal</dt>
              <dd className="text-text-primary tabular-nums">{formatINR(c.loan.outstandingPrincipal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Current repayment</dt>
              <dd className="text-text-primary tabular-nums">{formatINR(c.currentPayment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Projected available cash</dt>
              <dd className={availableCash < 0 ? 'text-stress-coral tabular-nums' : 'text-text-primary tabular-nums'}>
                {formatINR(availableCash)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Financial stress</dt>
              <dd>
                <Badge tone={stressTone(c.projectedStress)}>{stressLabel[c.projectedStress]}</Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card elevated>
        <CardHeader title="CareFlow recommendation" subtitle="Generated from the current optimization run." />
        <p className="text-[14px] text-text-primary leading-relaxed">
          CareFlow recommends reducing repayment during the next projected treatment-cost peak and
          redistributing repayment across periods with greater repayment capacity.
        </p>
      </Card>
    </div>
  )
}
