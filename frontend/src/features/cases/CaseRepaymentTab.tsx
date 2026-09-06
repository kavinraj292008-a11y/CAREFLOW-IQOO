import { useEffect } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { RepaymentTable } from '@/components/tables/RepaymentTable'
import { normalizeStress, periodLabel } from '@/utils/adapters'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

export function CaseRepaymentTab() {
  const { caseData } = useCaseStore()
  const { result, isOptimizing, runOptimization } = useRepaymentStore()

  useEffect(() => {
    if (caseData && !result && !isOptimizing) runOptimization(caseData)
  }, [caseData, result, isOptimizing, runOptimization])

  if (isOptimizing) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={14} className="animate-spin" />
        <span>Running optimization...</span>
      </div>
    )
  }

  if (!result || !caseData) return null

  const traditionalByPeriod = new Map(result.traditional.schedule.map((p) => [p.period, p]))

  const chartData = result.careflow.schedule.map((p) => ({
    label: periodLabel(p.period),
    treatment: p.medical_expense,
    traditional: traditionalByPeriod.get(p.period)?.payment ?? 0,
    careflow: p.payment,
  }))

  const tablePeriods = result.careflow.schedule.map((cp) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-muted">Source: CareFlow Financial Engine</span>
        <Link to="/app/repayment" className="text-[13px] text-accent-tealLight hover:underline">
          Open full optimizer →
        </Link>
      </div>
      <Card>
        <CardHeader title="Current vs CareFlow schedule" />
        <RepaymentComparisonChart data={chartData} />
      </Card>
      <Card>
        <CardHeader title="Repayment schedule" />
        <RepaymentTable periods={tablePeriods} />
      </Card>
    </div>
  )
}
