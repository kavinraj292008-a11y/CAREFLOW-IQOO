import { useEffect } from 'react'
import { useCaseStore, DEMO_CASE_ID } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, stressTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatINR, stressLabel } from '@/utils/format'
import { normalizeStress } from '@/utils/adapters'
import { Loader2, AlertCircle } from 'lucide-react'

export function LenderPage() {
  const { caseData, caseName, isLoading: caseLoading, loadDemoCase } = useCaseStore()
  const { result, isOptimizing, runOptimization } = useRepaymentStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  useEffect(() => {
    if (caseData && !result && !isOptimizing) runOptimization(caseData)
  }, [caseData, result, isOptimizing, runOptimization])

  if (caseLoading || isOptimizing) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
        <span>{isOptimizing ? 'Computing optimization...' : 'Loading...'}</span>
      </div>
    )
  }

  if (!caseData) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-stress-coral mt-0.5" />
          <p className="text-[13px] text-text-secondary">
            Demo case could not be loaded. Please visit the Repayment Optimizer first.
          </p>
        </div>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <p className="text-[13px] text-text-secondary">
          No optimization result available. Please run optimization from the Repayment Optimizer.
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => runOptimization(caseData)}>
          Run Optimization
        </Button>
      </Card>
    )
  }

  const { traditional, careflow, comparison, case_summary } = result
  const isInfeasible = careflow.optimization_status === 'infeasible'

  // Worst stress from CareFlow schedule
  const maxStressRaw = careflow.schedule.reduce((worst, p) => {
    const order = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    return order.indexOf(p.stress_level) > order.indexOf(worst) ? p.stress_level : worst
  }, 'LOW' as string)
  const projectedStress = normalizeStress(maxStressRaw as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL')

  const firstCareflowPayment = careflow.schedule[0]?.payment ?? 0
  const firstTraditionalPayment = traditional.schedule[0]?.payment ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Lender Analysis</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Case {DEMO_CASE_ID} · {caseName} · restructuring proposal review.
        </p>
      </div>

      {isInfeasible && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-stress-coral mt-0.5 shrink-0" />
            <div>
              <p className="text-[14px] font-medium text-text-primary">CareFlow optimization was not feasible under current constraints</p>
              {careflow.infeasibility_reason && (
                <p className="text-[13px] text-text-secondary mt-1">{careflow.infeasibility_reason}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Loan summary" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <p className="text-text-secondary">Outstanding principal</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{formatINR(case_summary.loan_principal)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Annual interest rate</p>
            <p className="text-text-primary font-medium mt-1">{case_summary.annual_interest_rate}% p.a.</p>
          </div>
          <div>
            <p className="text-text-secondary">Original tenure</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{careflow.metrics.original_tenure} months</p>
          </div>
          <div>
            <p className="text-text-secondary">Optimized tenure</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{careflow.metrics.optimized_tenure} months</p>
          </div>
          <div>
            <p className="text-text-secondary">Extension periods</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{careflow.metrics.extension_periods}</p>
          </div>
          <div>
            <p className="text-text-secondary">Projected stress (CareFlow)</p>
            <Badge tone={stressTone(projectedStress)} className="mt-1.5">
              {stressLabel[projectedStress]}
            </Badge>
          </div>
          <div>
            <p className="text-text-secondary">Total repayment (traditional)</p>
            <p className="text-text-primary font-medium tabular-nums mt-1">{formatINR(traditional.metrics.total_repayment)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Total repayment (CareFlow)</p>
            <p className={`font-medium tabular-nums mt-1 ${isInfeasible ? 'text-text-muted' : 'text-accent-tealLight'}`}>
              {isInfeasible ? 'Not available' : formatINR(careflow.metrics.total_repayment)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Repayment schedule comparison" />
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">Traditional EMI (Period 1)</span>
              <span className="text-text-primary tabular-nums">{formatINR(firstTraditionalPayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">CareFlow Period 1 payment</span>
              <span className={`tabular-nums ${isInfeasible ? 'text-text-muted' : 'text-accent-tealLight'}`}>
                {isInfeasible ? 'Not available' : formatINR(firstCareflowPayment)}
              </span>
            </div>
            <p className="text-[12px] text-text-muted border-t border-border pt-2">
              CareFlow uses an adaptive payment schedule — payments vary by period based on treatment costs.
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Stress reduction" />
          <div className="space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-text-secondary">Peak deficit reduction</span>
              <span className={`tabular-nums font-medium ${comparison.peak_deficit_reduction > 0 ? 'text-accent-tealLight' : 'text-stress-coral'}`}>
                {formatINR(comparison.peak_deficit_reduction)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">High-stress period reduction</span>
              <span className={`tabular-nums font-medium ${comparison.high_stress_period_reduction > 0 ? 'text-accent-tealLight' : 'text-stress-coral'}`}>
                {comparison.high_stress_period_reduction > 0 ? '-' : '+'}{Math.abs(comparison.high_stress_period_reduction)} periods
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Interest difference</span>
              <span className={`tabular-nums font-medium ${comparison.interest_difference > 0 ? 'text-stress-coral' : 'text-accent-tealLight'}`}>
                {comparison.interest_difference > 0 ? '+' : ''}{formatINR(comparison.interest_difference)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tenure difference</span>
              <span className="text-text-primary tabular-nums">
                {comparison.tenure_difference > 0 ? '+' : ''}{comparison.tenure_difference} months
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Lender constraints" />
        <div className="space-y-2 text-[13px]">
          {[
            {
              label: 'Minimum payment respected',
              passed: careflow.schedule.every((p) => p.payment >= case_summary.minimum_payment),
            },
            {
              label: 'Maximum payment respected',
              passed: careflow.schedule.every((p) => p.payment <= case_summary.maximum_payment),
            },
            {
              label: 'Extension within allowed range',
              passed: careflow.metrics.extension_periods <= case_summary.maximum_extension_periods,
            },
            {
              label: 'Optimization feasible',
              passed: careflow.optimization_status !== 'infeasible',
            },
          ].map((check) => (
            <div
              key={check.label}
              className="flex items-center justify-between py-2 border-b border-border/60 last:border-0"
            >
              <span className="text-text-secondary">{check.label}</span>
              <Badge tone={check.passed ? 'teal' : 'coral'}>{check.passed ? 'Passed' : 'Failed'}</Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card elevated>
        <CardHeader title="Privacy-aware data flow" subtitle="Clinical information is abstracted before reaching lender-facing views." />
        <div className="flex items-center gap-2 text-[12px] text-text-secondary overflow-x-auto pb-1 mb-4">
          {['Clinical data', 'Controlled processing', 'Financial abstraction', 'Optimization', 'Lender signal'].map(
            (step, i, arr) => (
              <div key={step} className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 rounded-sm border border-border">{step}</span>
                {i < arr.length - 1 && <span className="text-text-muted">→</span>}
              </div>
            ),
          )}
        </div>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Instead of exposing clinical diagnosis details, lender-facing views surface signals such as
          &ldquo;Period 3: Critical projected cashflow stress.&rdquo; This architecture is privacy-aware by design; it does not
          by itself guarantee regulatory compliance.
        </p>
      </Card>
    </div>
  )
}
