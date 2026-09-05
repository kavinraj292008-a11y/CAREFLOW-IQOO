import type { AiApi } from '@/services/api/types'
import { delay } from './delay'

export const mockAiApi: AiApi = {
  async explainOptimization(caseId, period) {
    return delay({
      prompt: `Explain optimization for ${caseId}${period ? `, period ${period}` : ''}`,
      response:
        'Repayment was reduced during the projected treatment-cost peak and redistributed across periods with greater repayment capacity, keeping the schedule within lender-defined payment bounds.',
      generatedAt: new Date().toISOString(),
    })
  },
  async summarizeCase(caseId) {
    return delay({
      prompt: `Summarize case ${caseId}`,
      response:
        'This case is currently under review. Treatment costs peak mid-cycle, creating a projected cashflow deficit under the traditional schedule. The CareFlow schedule lowers payments during the peak and raises them in lower-cost periods.',
      generatedAt: new Date().toISOString(),
    })
  },
  async interpretScenario(caseId, prompt) {
    return delay({
      prompt,
      response: `Based on the current treatment and financial profile for ${caseId}, this scenario would shift projected stress into adjacent periods. Re-run the simulation to see the updated schedule.`,
      generatedAt: new Date().toISOString(),
    })
  },
}
