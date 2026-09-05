import { create } from 'zustand'
import type { CashflowPoint } from '@/types'
import { cashflowApi } from '@/services/api'

interface CashflowState {
  points: CashflowPoint[]
  isLoading: boolean
  loadCashflow: (caseId: string) => Promise<void>
}

export const useCashflowStore = create<CashflowState>((set) => ({
  points: [],
  isLoading: false,
  loadCashflow: async (caseId: string) => {
    set({ isLoading: true })
    const points = await cashflowApi.getCashflow(caseId)
    set({ points, isLoading: false })
  },
}))
