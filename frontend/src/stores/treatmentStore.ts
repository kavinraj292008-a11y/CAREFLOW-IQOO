import { create } from 'zustand'
import type { TreatmentPlan } from '@/types'
import { treatmentApi } from '@/services/api'

interface TreatmentState {
  plan: TreatmentPlan | null
  presets: Record<string, TreatmentPlan>
  isLoading: boolean
  loadPlan: (caseId: string) => Promise<void>
  loadPresets: () => Promise<void>
}

export const useTreatmentStore = create<TreatmentState>((set) => ({
  plan: null,
  presets: {},
  isLoading: false,
  loadPlan: async (caseId: string) => {
    set({ isLoading: true })
    const plan = await treatmentApi.getPlan(caseId)
    set({ plan, isLoading: false })
  },
  loadPresets: async () => {
    const presets = await treatmentApi.listPresets()
    set({ presets })
  },
}))
