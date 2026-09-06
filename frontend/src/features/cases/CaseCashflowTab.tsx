import { useCaseStore } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { CashflowChart } from '@/components/charts/CashflowChart'
import { periodLabel } from '@/utils/adapters'

export function CaseCashflowTab() {
  const { caseData } = useCaseStore()
  const { result } = useRepaymentStore()

  if (!result || !caseData) {
    return (
      <Card>
        <p className="text-[13px] text-text-secondary">
          Run optimization from the Repayment tab to see cashflow projections.
        </p>
      </Card>
    )
  }

  const points = result.careflow.schedule.map((p) => ({
    period: p.period,
    label: periodLabel(p.period),
    income: p.income,
    householdExpenses: p.household_expenses,
    treatmentExpenses: p.medical_expense,
    repayment: p.payment,
    remainingCash: p.cashflow_after_payment,
  }))

  return (
    <Card>
      <CardHeader title="Cashflow analysis" subtitle="Income, expenses, treatment cost, repayment, and remaining cash by period. Source: CareFlow-optimized schedule." />
      <CashflowChart data={points} />
    </Card>
  )
}
