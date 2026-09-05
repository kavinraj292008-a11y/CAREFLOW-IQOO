import { create } from 'zustand'
import type { Case } from '@/types'
import { casesApi } from '@/services/api'

interface CaseState {
  cases: Case[]
  activeCase: Case | null
  isLoading: boolean
  loadCases: () => Promise<void>
  loadCase: (caseId: string) => Promise<void>
}

export const useCaseStore = create<CaseState>((set) => ({
  cases: [],
  activeCase: null,
  isLoading: false,
  loadCases: async () => {
    set({ isLoading: true })
    const cases = await casesApi.listCases()
    set({ cases, isLoading: false })
  },
  loadCase: async (caseId: string) => {
    set({ isLoading: true })
    const activeCase = await casesApi.getCase(caseId)
    set({ activeCase, isLoading: false })
  },
}))
