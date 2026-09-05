import { useEffect } from 'react'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { RepaymentTable } from '@/components/tables/RepaymentTable'
import { DemoDataBadge } from '@/components/feedback/DemoDataBadge'
import { Link } from 'react-router-dom'

export function CaseRepaymentTab({ caseId }: { caseId: string }) {
  const { result, runOptimization } = useRepaymentStore()

  useEffect(() => {
    runOptimization(caseId)
  }, [caseId, runOptimization])

  if (!result) return null

  const chartData = result.schedule.periods.map((p) => ({
    label: p.label,
    treatment: p.medicalCost,
    traditional: p.traditionalPayment,
    careflow: p.careflowPayment,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DemoDataBadge label="DEMO CALCULATION" />
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
        <RepaymentTable periods={result.schedule.periods} />
      </Card>
    </div>
  )
}
