import type { LenderApi } from '@/services/api/types'
import { demoLenderAnalysis } from './demoData'
import { delay } from './delay'

export const mockLenderApi: LenderApi = {
  async getAnalysis() {
    return delay(demoLenderAnalysis)
  },
}
