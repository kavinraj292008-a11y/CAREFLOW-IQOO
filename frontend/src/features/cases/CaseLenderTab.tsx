import { useEffect, useState } from 'react'
import { lenderApi } from '@/services/api'
import type { LenderAnalysis } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatINR } from '@/utils/format'
import { Badge } from '@/components/ui/Badge'

export function CaseLenderTab({ caseId }: { caseId: string }) {
  const [analysis, setAnalysis] = useState<LenderAnalysis | null>(null)

  useEffect(() => {
    lenderApi.getAnalysis(caseId).then(setAnalysis)
  }, [caseId])

  if (!analysis) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Lender analysis" />
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
            <p className="text-text-secondary">Proposed payment</p>
            <p className="text-accent-tealLight font-medium tabular-nums mt-1">{formatINR(analysis.proposedPayment)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Extension</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{analysis.extensionMonths} months</p>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Policy constraints" />
        <div className="space-y-2">
          {analysis.policyChecks.map((check) => (
            <div key={check.label} className="flex items-center justify-between text-[13px] py-1.5 border-b border-border/60 last:border-0">
              <span className="text-text-secondary">{check.label}</span>
              <Badge tone={check.passed ? 'teal' : 'coral'}>{check.passed ? 'Passed' : 'Failed'}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
