import { useEffect, useState } from 'react'
import { lenderApi } from '@/services/api'
import { demoCase } from '@/services/mock/demoData'
import type { LenderAnalysis } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, stressTone } from '@/components/ui/Badge'
import { formatINR, stressLabel } from '@/utils/format'

export function LenderPage() {
  const [analysis, setAnalysis] = useState<LenderAnalysis | null>(null)

  useEffect(() => {
    lenderApi.getAnalysis(demoCase.id).then(setAnalysis)
  }, [])

  if (!analysis) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Lender Analysis</h1>
        <p className="text-[14px] text-text-secondary mt-1">Case {analysis.caseId} · restructuring proposal review.</p>
      </div>

      <Card>
        <CardHeader title="Loan summary" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <p className="text-text-secondary">Outstanding principal</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{formatINR(analysis.outstandingPrincipal)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Current payment</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{formatINR(analysis.currentPayment)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Proposed CareFlow payment</p>
            <p className="text-accent-tealLight font-medium tabular-nums mt-1">{formatINR(analysis.proposedPayment)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Remaining tenure</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{analysis.remainingTenureMonths} months</p>
          </div>
          <div>
            <p className="text-text-secondary">Extension</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{analysis.extensionMonths} months</p>
          </div>
          <div>
            <p className="text-text-secondary">Projected stress</p>
            <Badge tone={stressTone(analysis.projectedStress)} className="mt-1.5">
              {stressLabel[analysis.projectedStress]}
            </Badge>
          </div>
          <div>
            <p className="text-text-secondary">Total repayment</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{formatINR(analysis.totalRepayment)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Interest impact</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{formatINR(analysis.interestImpact)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Policy constraints" />
        <div className="space-y-2">
          {analysis.policyChecks.map((check) => (
            <div key={check.label} className="flex items-center justify-between text-[13px] py-2 border-b border-border/60 last:border-0">
              <span className="text-text-secondary">{check.label}</span>
              <Badge tone={check.passed ? 'teal' : 'coral'}>{check.passed ? 'Passed' : 'Failed'}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card elevated>
        <CardHeader title="Restructuring recommendation" />
        <div className="grid sm:grid-cols-2 gap-6 mb-5 text-[13px]">
          <div>
            <p className="text-text-muted mb-1">Current schedule</p>
            <p className="text-text-primary">High projected cashflow stress</p>
          </div>
          <div>
            <p className="text-text-muted mb-1">CareFlow schedule</p>
            <p className="text-accent-tealLight">Lower projected cashflow stress</p>
          </div>
        </div>
        <p className="text-[14px] text-text-primary mb-5">Recommended action: review proposed restructuring.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">Review</Button>
          <Button variant="secondary" size="sm">Approve Placeholder</Button>
          <Button variant="ghost" size="sm">Request Manual Review</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Privacy-aware architecture" subtitle="Clinical information is abstracted before it reaches lender-facing views." />
        <div className="flex items-center gap-2 text-[12px] text-text-secondary overflow-x-auto pb-1 mb-4">
          {['Clinical information', 'Controlled processing', 'Financial abstraction', 'Optimization', 'Lender-facing signal'].map(
            (step, i, arr) => (
              <div key={step} className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-sm border border-border">{step}</span>
                {i < arr.length - 1 && <span className="text-text-muted">→</span>}
              </div>
            ),
          )}
        </div>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Instead of exposing unnecessary diagnosis information, the lender-facing workflow uses signals such as
          "Period 3: Critical projected cashflow stress." This architecture is privacy-aware by design; it does not
          by itself guarantee regulatory compliance.
        </p>
      </Card>
    </div>
  )
}
