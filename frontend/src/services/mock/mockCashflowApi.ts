import type { CashflowApi } from '@/services/api/types'
import type { CashflowPoint } from '@/types'
import { demoCase, buildDemoRepaymentPeriods } from './demoData'
import { delay } from './delay'

export const mockCashflowApi: CashflowApi = {
  async getCashflow() {
    const periods = buildDemoRepaymentPeriods()
    const points: CashflowPoint[] = periods.map((p) => ({
      period: p.period,
      label: p.label,
      income: demoCase.financial.monthlyIncome,
      householdExpenses: demoCase.financial.monthlyHouseholdExpenses,
      treatmentExpenses: p.medicalCost,
      repayment: p.careflowPayment,
      remainingCash: p.availableCash,
    }))
    return delay(points)
  },
}
