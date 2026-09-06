import { useEffect } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { useRepaymentStore, OPTIMIZATION_STEPS } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, stressTone } from '@/components/ui/Badge'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { RepaymentTable } from '@/components/tables/RepaymentTable'
import { ExplanationPanel } from './ExplanationPanel'
import { formatINR } from '@/utils/format'
import { normalizeStress, periodLabel } from '@/utils/adapters'
import type { CareFlowAnalysisResponse } from '@/services/api/backendTypes'
import { AlertCircle, Loader2 } from 'lucide-react'

function InfeasibleNotice({ reason }: { reason: string | null }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="text-stress-coral mt-0.5 shrink-0" />
        <div>
          <p className="text-[14px] font-medium text-text-primary">Optimization unavailable under current constraints</p>
          {reason && <p className="text-[13px] text-text-secondary mt-1">{reason}</p>}
        </div>
      </div>
    </Card>
  )
}

function OptimizingState({ step }: { step: number }) {
  return (
    <Card>
      <div className="flex items-center gap-3 py-2">
        <Loader2 size={16} className="text-accent-tealLight animate-spin shrink-0" />
        <div>
          <p className="text-[13px] text-text-primary">{OPTIMIZATION_STEPS[step]}</p>
          <div className="flex gap-1 mt-2">
            {OPTIMIZATION_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-accent-teal' : 'bg-border'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function ResultView({ result }: { result: CareFlowAnalysisResponse }) {
  const { traditional, careflow, comparison, explanations } = result

  // Build aligned chart data — CareFlow schedule may have extension periods
  const maxPeriod = Math.max(
    traditional.schedule[traditional.schedule.length - 1]?.period ?? 0,
    careflow.schedule[careflow.schedule.length - 1]?.period ?? 0,
  )

  const traditionalByPeriod = new Map(traditional.schedule.map((p) => [p.period, p]))
  const careflowByPeriod = new Map(careflow.schedule.map((p) => [p.period, p]))

  const chartData = Array.from({ length: maxPeriod }, (_, i) => {
    const period = i + 1
    const t = traditionalByPeriod.get(period)
    const c = careflowByPeriod.get(period)
    return {
      label: periodLabel(period),
      treatment: t?.medical_expense ?? c?.medical_expense ?? 0,
      traditional: t?.payment ?? 0,
      careflow: c?.payment ?? 0,
    }
  })

  // Build merged periods for table (CareFlow authoritative, Traditional aligned)
  const tablePeriods = careflow.schedule.map((cp) => {
    const tp = traditionalByPeriod.get(cp.period)
    return {
      period: cp.period,
      label: periodLabel(cp.period),
      medicalCost: cp.medical_expense,
      traditionalPayment: tp?.payment ?? 0,
      careflowPayment: cp.payment,
      availableCash: cp.cashflow_after_payment,
      stress: normalizeStress(cp.stress_level),
      beginningBalance: cp.beginning_balance,
      interest: cp.interest,
      principal: cp.principal,
      endingBalance: cp.ending_balance,
      changeReason: cp.explanation ?? undefined,
    }
  })

  const isInfeasible = careflow.optimization_status === 'infeasible'

  return (
    <>
      {isInfeasible && <InfeasibleNotice reason={careflow.infeasibility_reason} />}

      {!isInfeasible && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardHeader title="Treatment-aware repayment schedule" />
              <Badge tone="teal" className="text-[11px]">
                {careflow.optimization_status === 'optimal' ? 'Optimal' : 'Feasible'}
              </Badge>
            </div>
            <RepaymentComparisonChart data={chartData} height={340} />
          </Card>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-[12px] text-text-secondary">Peak projected deficit</p>
              <div className="flex items-baseline gap-4 mt-2">
                <div>
                  <p className="text-[11px] text-text-muted mb-1">Traditional</p>
                  <p className="text-[20px] font-semibold text-stress-coral tabular-nums">
                    {formatINR(traditional.metrics.peak_deficit)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted mb-1">CareFlow</p>
                  <p className="text-[20px] font-semibold text-accent-tealLight tabular-nums">
                    {formatINR(careflow.metrics.peak_deficit)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-[12px] text-text-secondary">High-stress periods</p>
              <div className="flex items-baseline gap-4 mt-2">
                <div>
                  <p className="text-[11px] text-text-muted mb-1">Traditional</p>
                  <p className="text-[20px] font-semibold text-stress-coral tabular-nums">
                    {traditional.metrics.high_stress_periods}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted mb-1">CareFlow</p>
                  <p className="text-[20px] font-semibold text-accent-tealLight tabular-nums">
                    {careflow.metrics.high_stress_periods}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-[12px] text-text-secondary">Critical-stress periods</p>
              <div className="flex items-baseline gap-4 mt-2">
                <div>
                  <p className="text-[11px] text-text-muted mb-1">Traditional</p>
                  <p className="text-[20px] font-semibold text-stress-coral tabular-nums">
                    {traditional.metrics.critical_stress_periods}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted mb-1">CareFlow</p>
                  <p className="text-[20px] font-semibold text-accent-tealLight tabular-nums">
                    {careflow.metrics.critical_stress_periods}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-[12px] text-text-secondary">Extension periods</p>
              <p className="text-[28px] font-semibold text-text-primary tabular-nums mt-2">
                {careflow.metrics.extension_periods}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Tenure difference: {comparison.tenure_difference > 0 ? '+' : ''}{comparison.tenure_difference} months
              </p>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <p className="text-[12px] text-text-secondary">Total repayment</p>
              <div className="flex items-baseline gap-4 mt-2">
                <div>
                  <p className="text-[11px] text-text-muted mb-1">Traditional</p>
                  <p className="text-[16px] font-semibold text-text-primary tabular-nums">
                    {formatINR(traditional.metrics.total_repayment)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-text-muted mb-1">CareFlow</p>
                  <p className="text-[16px] font-semibold text-accent-tealLight tabular-nums">
                    {formatINR(careflow.metrics.total_repayment)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <p className="text-[12px] text-text-secondary">Interest difference</p>
              <p className={`text-[28px] font-semibold tabular-nums mt-2 ${comparison.interest_difference > 0 ? 'text-stress-coral' : 'text-accent-tealLight'}`}>
                {comparison.interest_difference > 0 ? '+' : ''}{formatINR(comparison.interest_difference)}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">Additional interest vs traditional schedule</p>
            </Card>
          </div>

          <Card>
            <CardHeader title="Repayment schedule detail" subtitle="Click any row to expand period-level detail." />
            <RepaymentTable periods={tablePeriods} />
          </Card>

          <ExplanationPanel explanations={explanations} />
        </>
      )}

      {isInfeasible && traditional && (
        <Card>
          <CardHeader title="Traditional schedule (baseline)" subtitle="Optimization was not feasible — showing traditional schedule only." />
          <RepaymentComparisonChart
            data={traditional.schedule.map((p) => ({
              label: periodLabel(p.period),
              treatment: p.medical_expense,
              traditional: p.payment,
              careflow: 0,
            }))}
            height={300}
          />
        </Card>
      )}
    </>
  )
}

export function RepaymentOptimizerPage() {
  const { caseData, caseName, isLoading: caseLoading, error: caseError, loadDemoCase } = useCaseStore()
  const { result, isOptimizing, optimizingStep, error: optError, runOptimization, clearError } = useRepaymentStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  useEffect(() => {
    if (caseData && !result && !isOptimizing) {
      runOptimization(caseData)
    }
  }, [caseData, result, isOptimizing, runOptimization])

  if (caseLoading) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading demo case...</span>
      </div>
    )
  }

  if (caseError) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-stress-coral mt-0.5 shrink-0" />
          <div>
            <p className="text-[14px] font-medium text-text-primary">CareFlow Financial Engine is unavailable.</p>
            <p className="text-[13px] text-text-secondary mt-1">{caseError}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={loadDemoCase}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Repayment Optimizer</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Compare the traditional fixed-EMI schedule with CareFlow&apos;s treatment-aware adaptive schedule.
        </p>
      </div>

      {caseData && (
        <Card>
          <CardHeader title="CF-DEMO-001" subtitle={caseName} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
            <div>
              <p className="text-text-secondary">Annual income</p>
              <p className="text-text-primary mt-0.5 tabular-nums">{formatINR(caseData.income)}</p>
            </div>
            <div>
              <p className="text-text-secondary">Loan principal</p>
              <p className="text-text-primary mt-0.5 tabular-nums">{formatINR(caseData.loan.principal)}</p>
            </div>
            <div>
              <p className="text-text-secondary">Interest rate</p>
              <p className="text-text-primary mt-0.5">{caseData.loan.annual_interest_rate}% p.a.</p>
            </div>
            <div>
              <p className="text-text-secondary">Treatment periods</p>
              <p className="text-text-primary mt-0.5">{caseData.treatment_costs.length} months</p>
            </div>
          </div>
        </Card>
      )}

      {caseData && (
        <Card>
          <CardHeader title="Optimization controls" />
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-[13px] text-text-secondary">
              Min payment: <span className="text-text-primary tabular-nums">{formatINR(caseData.constraints.minimum_payment)}</span>
            </div>
            <div className="text-[13px] text-text-secondary">
              Max payment: <span className="text-text-primary tabular-nums">{formatINR(caseData.constraints.maximum_payment)}</span>
            </div>
            <div className="text-[13px] text-text-secondary">
              Max extension: <span className="text-text-primary">{caseData.constraints.maximum_extension_periods} months</span>
            </div>
            <Button
              variant="primary"
              onClick={() => { clearError(); runOptimization(caseData) }}
              disabled={isOptimizing}
            >
              {isOptimizing ? 'Running...' : result ? 'Re-optimize' : 'Run Optimization'}
            </Button>
          </div>
        </Card>
      )}

      {optError && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-stress-coral mt-0.5 shrink-0" />
            <p className="text-[13px] text-text-secondary">{optError}</p>
          </div>
        </Card>
      )}

      {isOptimizing && <OptimizingState step={optimizingStep} />}

      {result && !isOptimizing && <ResultView result={result} />}

      {!result && !isOptimizing && !optError && caseData && (
        <div className="text-[13px] text-text-muted py-4">Click Run Optimization to begin.</div>
      )}
    </div>
  )
}
