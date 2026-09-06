import { useEffect } from 'react'
import { useCaseStore, DEMO_CASE_ID } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { MetricStat } from '@/components/ui/MetricStat'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, stressTone } from '@/components/ui/Badge'
import { formatINR, stressLabel } from '@/utils/format'
import { normalizeStress } from '@/utils/adapters'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function DashboardPage() {
  const { caseData, caseName, isLoading, loadDemoCase } = useCaseStore()
  const { result, isOptimizing, runOptimization } = useRepaymentStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  useEffect(() => {
    if (caseData && !result && !isOptimizing) runOptimization(caseData)
  }, [caseData, result, isOptimizing, runOptimization])

  const loading = isLoading || isOptimizing

  const currentBalance = result
    ? result.careflow.schedule[result.careflow.schedule.length - 1]?.ending_balance ?? result.case_summary.loan_principal
    : caseData?.loan.principal ?? null

  const worstStressRaw = result?.careflow.schedule.reduce((worst, p) => {
    const order = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']
    return order.indexOf(p.stress_level) > order.indexOf(worst) ? p.stress_level : worst
  }, 'LOW') ?? null

  const worstStress = worstStressRaw ? normalizeStress(worstStressRaw as 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL') : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">CareFlow Overview</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Treatment-aware medical debt restructuring — synthetic illustrative prototype.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-border text-[11px] text-text-muted">
        Illustrative demo prototype — not financial advice
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-text-secondary text-[13px]">
          <Loader2 size={14} className="animate-spin" />
          <span>Loading demo data...</span>
        </div>
      )}

      {caseData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricStat
            label="Annual income"
            value={formatINR(caseData.income)}
          />
          <MetricStat
            label="Loan principal"
            value={formatINR(caseData.loan.principal)}
          />
          <MetricStat
            label="Current balance"
            value={currentBalance ? formatINR(currentBalance) : '—'}
          />
          <MetricStat
            label="Treatment periods"
            value={String(caseData.treatment_costs.length)}
          />
        </div>
      )}

      {result && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Optimization status" />
            <div className="flex items-center gap-3 mt-2">
              <Badge tone={result.careflow.optimization_status === 'infeasible' ? 'coral' : 'teal'}>
                {result.careflow.optimization_status}
              </Badge>
              <span className="text-[13px] text-text-secondary">
                {result.careflow.metrics.extension_periods} extension periods
              </span>
            </div>
          </Card>

          <Card>
            <CardHeader title="Peak cashflow stress (CareFlow)" />
            <div className="mt-2">
              {worstStress && (
                <Badge tone={stressTone(worstStress)}>
                  {stressLabel[worstStress]}
                </Badge>
              )}
              <p className="text-[12px] text-text-muted mt-2">
                Peak deficit: {formatINR(result.careflow.metrics.peak_deficit)}
              </p>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader title={`Demo Case — ${DEMO_CASE_ID}`} subtitle={caseName || 'Chemotherapy Demo — Canonical'} />
        <p className="text-[13px] text-text-secondary mb-4">
          Synthetic illustrative scenario. No real patient data is used.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/app/repayment"
            className="text-[13px] text-accent-tealLight hover:underline underline-offset-2"
          >
            Run Repayment Optimizer →
          </Link>
          <Link
            to="/app/simulation"
            className="text-[13px] text-accent-tealLight hover:underline underline-offset-2"
          >
            Open Simulator →
          </Link>
          <Link
            to="/app/lender"
            className="text-[13px] text-accent-tealLight hover:underline underline-offset-2"
          >
            Lender Analysis →
          </Link>
        </div>
      </Card>

      <Card>
        <CardHeader title="How CareFlow works" />
        <div className="flex items-center gap-2 text-[12px] text-text-secondary overflow-x-auto pb-1">
          {[
            'Treatment timeline',
            'Cost curve',
            'Cashflow analysis',
            'Repayment stress',
            'Optimization',
            'Adaptive schedule',
          ].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-sm border border-border whitespace-nowrap">{step}</span>
              {i < arr.length - 1 && <span className="text-text-muted">→</span>}
            </div>
          ))}
        </div>
        <p className="text-[13px] text-text-secondary mt-4 leading-relaxed">
          CareFlow uses deterministic linear programming (OR-Tools) to shift repayment burden across periods, 
          respecting minimum/maximum payment constraints and maximum extension limits. 
          The optimization engine is not AI — it is a financial scheduling algorithm.
        </p>
      </Card>
    </div>
  )
}
