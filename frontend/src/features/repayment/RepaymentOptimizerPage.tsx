import { useEffect, useState } from 'react'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { demoCase } from '@/services/mock/demoData'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DemoDataBadge } from '@/components/feedback/DemoDataBadge'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { RepaymentTable } from '@/components/tables/RepaymentTable'
import { ExplanationPanel } from './ExplanationPanel'
import { formatINR } from '@/utils/format'

export function RepaymentOptimizerPage() {
  const { result, isOptimizing, runOptimization } = useRepaymentStore()
  const [minPayment, setMinPayment] = useState(demoCase.constraints.minPayment)
  const [maxPayment, setMaxPayment] = useState(demoCase.constraints.maxPayment)
  const [maxExtension, setMaxExtension] = useState(demoCase.constraints.maxExtensionMonths)

  useEffect(() => {
    runOptimization(demoCase.id)
  }, [runOptimization])

  const chartData = result?.schedule.periods.map((p) => ({
    label: p.label,
    treatment: p.medicalCost,
    traditional: p.traditionalPayment,
    careflow: p.careflowPayment,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Repayment Optimizer</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Compare the current repayment schedule with CareFlow's treatment-aware schedule.
        </p>
      </div>

      <Card>
        <CardHeader title={`Case ${demoCase.id}`} subtitle={demoCase.patientLabel} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <p className="text-text-secondary">Treatment</p>
            <p className="text-text-primary mt-0.5">{demoCase.treatment.name.replace(' Demo', '')}</p>
          </div>
          <div>
            <p className="text-text-secondary">Loan</p>
            <p className="text-text-primary mt-0.5 tabular-nums">{formatINR(demoCase.loan.outstandingPrincipal)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Income</p>
            <p className="text-text-primary mt-0.5 tabular-nums">{formatINR(demoCase.financial.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Household expenses</p>
            <p className="text-text-primary mt-0.5 tabular-nums">{formatINR(demoCase.financial.monthlyHouseholdExpenses)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Optimization controls" />
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <label className="text-[12px] text-text-secondary">
            Minimum payment
            <input
              type="number"
              value={minPayment}
              onChange={(e) => setMinPayment(Number(e.target.value))}
              className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
            />
          </label>
          <label className="text-[12px] text-text-secondary">
            Maximum payment
            <input
              type="number"
              value={maxPayment}
              onChange={(e) => setMaxPayment(Number(e.target.value))}
              className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
            />
          </label>
          <label className="text-[12px] text-text-secondary">
            Maximum extension (months)
            <input
              type="number"
              value={maxExtension}
              onChange={(e) => setMaxExtension(Number(e.target.value))}
              className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
            />
          </label>
        </div>
        <Button variant="primary" onClick={() => runOptimization(demoCase.id)} disabled={isOptimizing}>
          {isOptimizing ? 'Running Optimization…' : 'Run Optimization'}
        </Button>
      </Card>

      {result && chartData && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardHeader title="Current vs CareFlow schedule" />
              <DemoDataBadge label="DEMO CALCULATION" />
            </div>
            <RepaymentComparisonChart data={chartData} height={340} />
          </Card>

          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Peak projected deficit" />
              <div className="flex items-baseline gap-6">
                <div>
                  <p className="text-[12px] text-text-secondary">Traditional</p>
                  <p className="text-[24px] font-semibold text-stress-coral tabular-nums mt-1">
                    {formatINR(result.comparison.peakDeficitTraditional)}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-text-secondary">CareFlow</p>
                  <p className="text-[24px] font-semibold text-accent-tealLight tabular-nums mt-1">
                    {formatINR(result.comparison.peakDeficitCareflow)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader title="High-stress periods" />
              <div className="flex items-baseline gap-6">
                <div>
                  <p className="text-[12px] text-text-secondary">Traditional</p>
                  <p className="text-[24px] font-semibold text-stress-coral tabular-nums mt-1">
                    {result.comparison.highStressPeriodsTraditional}
                  </p>
                </div>
                <div>
                  <p className="text-[12px] text-text-secondary">CareFlow</p>
                  <p className="text-[24px] font-semibold text-accent-tealLight tabular-nums mt-1">
                    {result.comparison.highStressPeriodsCareflow}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Repayment schedule" subtitle="Click a row to see period-level detail." />
            <RepaymentTable periods={result.schedule.periods} />
          </Card>

          <ExplanationPanel periods={result.schedule.periods} />
        </>
      )}
    </div>
  )
}
