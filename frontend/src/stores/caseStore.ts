import { create } from 'zustand'
import { demoApi } from '@/services/api'
import type { CareFlowCaseRequest } from '@/services/api/backendTypes'
import { ApiError } from '@/services/api'

// Frontend-only demo case identifier (not sent to backend)
export const DEMO_CASE_ID = 'CF-DEMO-001'

export interface DemoCaseState {
  caseData: CareFlowCaseRequest | null
  caseName: string
  caseDescription: string
  isLoading: boolean
  error: string | null
  loadDemoCase: () => Promise<void>
}

export const useCaseStore = create<DemoCaseState>((set) => ({
  caseData: null,
  caseName: '',
  caseDescription: '',
  isLoading: false,
  error: null,

  loadDemoCase: async () => {
    set({ isLoading: true, error: null })
    try {
      const resp = await demoApi.getDemoCase()
      const entry = resp.cases.canonical
      set({
        caseData: entry.case,
        caseName: entry.name,
        caseDescription: entry.description,
        isLoading: false,
      })
    } catch (e) {
      const msg = e instanceof ApiError ? e.userMessage : 'Failed to load demo case.'
      set({ error: msg, isLoading: false })
    }
  },
}))
