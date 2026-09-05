import type { SimulationApi } from '@/services/api/types'
import type { RepaymentPeriod, SimulationEvent } from '@/types'
import { buildDemoRepaymentPeriods } from './demoData'
import { delay } from './delay'

export const mockSimulationApi: SimulationApi = {
  async applyEvent(caseId: string, event: SimulationEvent) {
    const original = buildDemoRepaymentPeriods()
    let updated: RepaymentPeriod[] = original.map((p) => ({ ...p }))
    let changedFromPeriod = original.length + 1

    if (event.type === 'add_cycle' && event.targetPeriod) {
      changedFromPeriod = event.targetPeriod
      const extra = event.additionalCost ?? 75000
      updated = updated.map((p) =>
        p.period >= event.targetPeriod!
          ? {
              ...p,
              medicalCost: p.period === event.targetPeriod ? p.medicalCost + extra : p.medicalCost,
              careflowPayment: p.period === event.targetPeriod ? Math.max(12000, p.careflowPayment - 5000) : p.careflowPayment,
              stress: p.period === event.targetPeriod ? 'critical' : p.stress,
              changeReason:
                p.period === event.targetPeriod
                  ? 'Additional treatment cycle increases projected cost in this period. Repayment reduced and redistributed to adjacent lower-cost periods.'
                  : p.changeReason,
            }
          : p,
      )
    } else if (event.type === 'unexpected_expense' && event.targetPeriod) {
      changedFromPeriod = event.targetPeriod
      const extra = event.additionalCost ?? 40000
      updated = updated.map((p) =>
        p.period === event.targetPeriod
          ? {
              ...p,
              medicalCost: p.medicalCost + extra,
              careflowPayment: Math.max(12000, p.careflowPayment - 4000),
              stress: 'critical',
              changeReason: 'Unexpected expense recorded for this period. Repayment temporarily reduced.',
            }
          : p,
      )
    } else if (event.type === 'delay_treatment') {
      changedFromPeriod = 1
      const shift = event.delayMonths ?? 1
      updated = updated.map((p, i) => {
        const source = original[Math.max(0, i - shift)]
        return source ? { ...p, medicalCost: source.medicalCost, stress: source.stress } : p
      })
    } else if (event.type === 'increase_frequency') {
      changedFromPeriod = 1
      updated = updated.map((p) => ({
        ...p,
        medicalCost: Math.round(p.medicalCost * 1.15),
      }))
    }

    return delay(
      {
        caseId,
        event,
        originalSchedule: { caseId, periods: original },
        updatedSchedule: { caseId, periods: updated },
        changedFromPeriod,
      },
      700,
    )
  },
}
