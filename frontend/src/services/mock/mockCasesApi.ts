import type { CasesApi } from '@/services/api/types'
import { demoActivity, demoCase, demoCasesList, demoPortfolioMetrics, demoPortfolioStress } from './demoData'
import { delay } from './delay'

export const mockCasesApi: CasesApi = {
  async listCases() {
    return delay(demoCasesList)
  },
  async getCase(caseId: string) {
    const found = demoCasesList.find((c) => c.id === caseId) ?? (caseId === demoCase.id ? demoCase : null)
    return delay(found)
  },
  async getPortfolioMetrics() {
    return delay(demoPortfolioMetrics)
  },
  async getPortfolioStress() {
    return delay(demoPortfolioStress)
  },
  async getActivity(caseId: string) {
    return delay(demoActivity.filter((a) => a.caseId === caseId))
  },
}
