import { useEffect } from 'react'
import { useCashflowStore } from '@/stores/cashflowStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { CashflowChart } from '@/components/charts/CashflowChart'
import { demoCase } from '@/services/mock/demoData'
import { formatINR } from '@/utils/format'
import { ArrowDown } from 'lucide-react'

const flowSteps = [
  { label: 'Income', value: demoCase.financial.monthlyIncome },
  { label: 'Household expenses', value: -demoCase.financial.monthlyHouseholdExpenses },
  { label: 'Treatment expenses (peak period)', value: -110000 },
  { label: 'Loan repayment', value: -20000 },
]

export function CashflowPage() {
  const { points, loadCashflow } = useCashflowStore()

  useEffect(() => {
    loadCashflow(demoCase.id)
  }, [loadCashflow])

  const remaining = flowSteps.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Cashflow Analysis</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Income, household expenses, treatment cost, and repayment across the treatment horizon.
        </p>
      </div>

      <Card>
        <CardHeader title="Monthly cashflow, by period" />
        <CashflowChart data={points} />
      </Card>

      <Card>
        <CardHeader title="Peak-period cashflow" subtitle="Illustrative walk from income to remaining cash for the highest-cost period." />
        <div className="max-w-sm mx-auto">
          {flowSteps.map((step) => (
            <div key={step.label}>
              <div className="flex items-center justify-between py-2.5 text-[13px]">
                <span className="text-text-secondary">{step.label}</span>
                <span className={step.value < 0 ? 'text-stress-coral tabular-nums' : 'text-text-primary tabular-nums'}>
                  {step.value < 0 ? '−' : ''}
                  {formatINR(Math.abs(step.value))}
                </span>
              </div>
              <div className="flex justify-center text-text-muted">
                <ArrowDown size={14} />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 border-t border-border mt-1 text-[14px] font-semibold">
            <span className="text-text-primary">Remaining cash / deficit</span>
            <span className={remaining < 0 ? 'text-stress-coral tabular-nums' : 'text-accent-tealLight tabular-nums'}>
              {formatINR(remaining)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
