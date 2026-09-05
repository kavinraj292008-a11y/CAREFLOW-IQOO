import { useEffect, useState } from 'react'
import { cashflowApi } from '@/services/api'
import type { CashflowPoint } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { CashflowChart } from '@/components/charts/CashflowChart'

export function CaseCashflowTab({ caseId }: { caseId: string }) {
  const [points, setPoints] = useState<CashflowPoint[]>([])

  useEffect(() => {
    cashflowApi.getCashflow(caseId).then(setPoints)
  }, [caseId])

  return (
    <Card>
      <CardHeader title="Cashflow analysis" subtitle="Income, expenses, treatment cost, repayment, and remaining cash by period." />
      <CashflowChart data={points} />
    </Card>
  )
}
