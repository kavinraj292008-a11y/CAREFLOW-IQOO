import type { TreatmentApi } from '@/services/api/types'
import { demoTreatmentPlan, treatmentPresets } from './demoData'
import { delay } from './delay'

export const mockTreatmentApi: TreatmentApi = {
  async getPlan() {
    return delay(demoTreatmentPlan)
  },
  async listPresets() {
    return delay(treatmentPresets)
  },
}
