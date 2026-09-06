import { useEffect } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { CashflowChart } from '@/components/charts/CashflowChart'
import { Button } from '@/components/ui/Button'
import { formatINR } from '@/utils/format'
import { periodLabel } from '@/utils/adapters'
import { Loader2 } from 'lucide-react'

export function CashflowPage() {
  const { caseData, loadDemoCase } = useCaseStore()
  const { result, isOptimizing, runOptimization } = useRepaymentStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  useEffect(() => {
    if (caseData && !result && !isOptimizing) runOptimization(caseData)
  }, [caseData, result, isOptimizing, runOptimization])

  if (!caseData || isOptimizing) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading cashflow data...</span>
      </div>
    )
  }

  if (!result) {
    return (
      <Card>
        <p className="text-[13px] text-text-secondary mb-3">
          Run optimization to view cashflow projections derived from the backend schedule.
        </p>
        <Button variant="secondary" size="sm" onClick={() => runOptimization(caseData)}>
          Run Optimization
        </Button>
      </Card>
    )
  }

  const schedule = result.careflow.schedule
  const chartData = schedule.map((p) => ({
    period: p.period,
    label: periodLabel(p.period),
    income: p.income,
    householdExpenses: p.household_expenses,
    treatmentExpenses: p.medical_expense,
    repayment: p.payment,
    remainingCash: p.cashflow_after_payment,
  }))

  const monthlyIncome = caseData.income / 12

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Cashflow Projection</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Cashflow derived from the CareFlow-optimized repayment schedule.
        </p>
      </div>

      <Card>
        <CardHeader title="Summary" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px]">
          <div>
            <p className="text-text-secondary">Annual income</p>
            <p className="text-text-primary tabular-nums mt-1">{formatINR(caseData.income)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Monthly income</p>
            <p className="text-text-primary tabular-nums mt-1">{formatINR(monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Household expenses</p>
            <p className="text-text-primary tabular-nums mt-1">{formatINR(caseData.monthly_household_expenses)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Schedule source</p>
            <p className="text-accent-tealLight font-medium mt-1">CareFlow optimized</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Cashflow after payment" subtitle="Remaining cash each period after treatment costs and CareFlow repayment." />
        <CashflowChart data={chartData} height={300} />
      </Card>

      <Card>
        <CardHeader title="Period cashflow breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[600px]">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="py-2 font-medium">Period</th>
                <th className="py-2 font-medium text-right">Income</th>
                <th className="py-2 font-medium text-right">Household</th>
                <th className="py-2 font-medium text-right">Treatment</th>
                <th className="py-2 font-medium text-right">Repayment</th>
                <th className="py-2 font-medium text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.period} className="border-b border-border/60">
                  <td className="py-2 text-text-primary">{row.label}</td>
                  <td className="py-2 text-text-secondary tabular-nums text-right">{formatINR(row.income)}</td>
                  <td className="py-2 text-text-secondary tabular-nums text-right">{formatINR(row.householdExpenses)}</td>
                  <td className="py-2 text-stress-coral tabular-nums text-right">{formatINR(row.treatmentExpenses)}</td>
                  <td className="py-2 text-accent-tealLight tabular-nums text-right">{formatINR(row.repayment)}</td>
                  <td className={`py-2 tabular-nums text-right font-medium ${row.remainingCash < 0 ? 'text-stress-coral' : 'text-text-primary'}`}>
                    {formatINR(row.remainingCash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
