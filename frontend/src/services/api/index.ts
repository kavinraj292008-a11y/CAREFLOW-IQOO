// Single point of truth for which implementation the UI talks to.
// When the backend is ready: implement CasesApi/TreatmentApi/etc. against
// real HTTP calls and swap the exports below — no UI code should need to change.
import { mockCasesApi } from '@/services/mock/mockCasesApi'
import { mockTreatmentApi } from '@/services/mock/mockTreatmentApi'
import { mockCashflowApi } from '@/services/mock/mockCashflowApi'
import { mockRepaymentApi } from '@/services/mock/mockRepaymentApi'
import { mockSimulationApi } from '@/services/mock/mockSimulationApi'
import { mockLenderApi } from '@/services/mock/mockLenderApi'
import { mockAiApi } from '@/services/mock/mockAiApi'

export const casesApi = mockCasesApi
export const treatmentApi = mockTreatmentApi
export const cashflowApi = mockCashflowApi
export const repaymentApi = mockRepaymentApi
export const simulationApi = mockSimulationApi
export const lenderApi = mockLenderApi
export const aiApi = mockAiApi
