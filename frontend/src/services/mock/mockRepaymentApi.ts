import type { RepaymentApi } from '@/services/api/types'
import { buildDemoComparisonMetrics, buildDemoRepaymentPeriods, demoCase, IS_DEMO } from './demoData'
import { delay } from './delay'

export const mockRepaymentApi: RepaymentApi = {
  async optimize(caseId: string) {
    const periods = buildDemoRepaymentPeriods()
    const comparison = buildDemoComparisonMetrics(periods)
    return delay(
      {
        caseId,
        schedule: { caseId, periods },
        comparison,
        generatedAt: new Date().toISOString(),
        isDemo: IS_DEMO,
      },
      600,
    )
  },
}

void demoCase
