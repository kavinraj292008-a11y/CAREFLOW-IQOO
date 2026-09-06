import { create } from 'zustand'
import { repaymentApi } from '@/services/api'
import { ApiError } from '@/services/api'
import type { CareFlowCaseRequest, CareFlowAnalysisResponse } from '@/services/api/backendTypes'

interface RepaymentState {
  result: CareFlowAnalysisResponse | null
  isOptimizing: boolean
  optimizingStep: number
  error: string | null
  runOptimization: (caseData: CareFlowCaseRequest) => Promise<void>
  clearError: () => void
}

const STEPS = [
  'Analyzing treatment timeline',
  'Projecting cashflow',
  'Applying repayment constraints',
  'Generating optimized schedule',
]

export const useRepaymentStore = create<RepaymentState>((set) => ({
  result: null,
  isOptimizing: false,
  optimizingStep: 0,
  error: null,

  clearError: () => set({ error: null }),

  runOptimization: async (caseData: CareFlowCaseRequest) => {
    set({ isOptimizing: true, error: null, optimizingStep: 0 })

    // Step cycle for UI feedback (cosmetic — backend is synchronous)
    let step = 0
    const interval = setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 1)
      set({ optimizingStep: step })
    }, 600)

    try {
      const result = await repaymentApi.optimize(caseData)
      clearInterval(interval)
      set({ result, isOptimizing: false, optimizingStep: 0 })
    } catch (e) {
      clearInterval(interval)
      const msg = e instanceof ApiError ? e.userMessage : 'CareFlow optimization could not be completed.'
      set({ error: msg, isOptimizing: false, optimizingStep: 0 })
    }
  },
}))

export const OPTIMIZATION_STEPS = STEPS
