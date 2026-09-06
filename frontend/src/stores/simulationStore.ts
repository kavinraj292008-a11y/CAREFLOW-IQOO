import { create } from 'zustand'
import { simulationApi } from '@/services/api'
import { ApiError } from '@/services/api'
import type { CareFlowCaseRequest, ReplanResultDto, SimulationEventDto } from '@/services/api/backendTypes'

interface SimulationState {
  result: ReplanResultDto | null
  isSimulating: boolean
  error: string | null
  replan: (
    caseData: CareFlowCaseRequest,
    completedPeriods: number,
    completedPayments: number[],
    event: SimulationEventDto,
  ) => Promise<void>
  reset: () => void
  clearError: () => void
}

export const useSimulationStore = create<SimulationState>((set) => ({
  result: null,
  isSimulating: false,
  error: null,

  clearError: () => set({ error: null }),
  reset: () => set({ result: null, error: null }),

  replan: async (caseData, completedPeriods, completedPayments, event) => {
    set({ isSimulating: true, error: null })
    try {
      const result = await simulationApi.replan({
        case: caseData,
        completed_periods: completedPeriods,
        completed_payments: completedPayments,
        event,
      })
      set({ result, isSimulating: false })
    } catch (e) {
      const msg = e instanceof ApiError ? e.userMessage : 'Simulation could not be completed.'
      set({ error: msg, isSimulating: false })
    }
  },
}))
