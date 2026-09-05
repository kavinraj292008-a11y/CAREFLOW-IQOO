import { create } from 'zustand'
import type { OptimizationResult } from '@/types'
import { repaymentApi } from '@/services/api'

interface RepaymentState {
  result: OptimizationResult | null
  isOptimizing: boolean
  runOptimization: (caseId: string) => Promise<void>
}

export const useRepaymentStore = create<RepaymentState>((set) => ({
  result: null,
  isOptimizing: false,
  runOptimization: async (caseId: string) => {
    set({ isOptimizing: true })
    const result = await repaymentApi.optimize(caseId)
    set({ result, isOptimizing: false })
  },
}))
