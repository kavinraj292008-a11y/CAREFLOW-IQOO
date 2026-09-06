import { useEffect } from 'react'
import { useCaseStore, DEMO_CASE_ID } from '@/stores/caseStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/utils/format'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function CasesListPage() {
  const { caseData, caseName, caseDescription, isLoading, loadDemoCase } = useCaseStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Cases</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          This prototype contains a single synthetic demonstration case.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border text-[11px] text-text-muted">
        No backend case database — prototype demo only
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-text-secondary text-[13px]">
          <Loader2 size={14} className="animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {caseData && (
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-text-primary">{DEMO_CASE_ID}</span>
                <Badge tone="teal" className="text-[11px]">Synthetic demo</Badge>
              </div>
              <p className="text-[14px] text-text-secondary">{caseName}</p>
              <p className="text-[12px] text-text-muted mt-1 max-w-prose">{caseDescription}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12px] mt-4">
                <div>
                  <p className="text-text-muted">Annual income</p>
                  <p className="text-text-secondary tabular-nums mt-0.5">{formatINR(caseData.income)}</p>
                </div>
                <div>
                  <p className="text-text-muted">Loan principal</p>
                  <p className="text-text-secondary tabular-nums mt-0.5">{formatINR(caseData.loan.principal)}</p>
                </div>
                <div>
                  <p className="text-text-muted">Treatment periods</p>
                  <p className="text-text-secondary mt-0.5">{caseData.treatment_costs.length} months</p>
                </div>
                <div>
                  <p className="text-text-muted">Interest rate</p>
                  <p className="text-text-secondary mt-0.5">{caseData.loan.annual_interest_rate}% p.a.</p>
                </div>
              </div>
            </div>
            <Link to={`/app/cases/${DEMO_CASE_ID}`}>
              <Button variant="secondary" size="sm">Open Case</Button>
            </Link>
          </div>
        </Card>
      )}

      <Card>
        <p className="text-[12px] text-text-muted leading-relaxed">
          In a production deployment, this page would list cases from a backend case database.
          The current prototype does not include case persistence — only the canonical demo case
          loaded from <code className="text-text-secondary">/api/demo-case</code> is available.
        </p>
      </Card>
    </div>
  )
}
