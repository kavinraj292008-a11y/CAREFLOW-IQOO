import { create } from 'zustand'
import type { SimulationEvent, SimulationResult } from '@/types'
import { simulationApi } from '@/services/api'

interface SimulationState {
  result: SimulationResult | null
  isSimulating: boolean
  applyEvent: (caseId: string, event: SimulationEvent) => Promise<void>
  reset: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  result: null,
  isSimulating: false,
  applyEvent: async (caseId, event) => {
    set({ isSimulating: true })
    const result = await simulationApi.applyEvent(caseId, event)
    set({ result, isSimulating: false })
  },
  reset: () => set({ result: null }),
}))
