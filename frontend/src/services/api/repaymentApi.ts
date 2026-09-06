import { apiPost } from './client'
import type { CareFlowCaseRequest, CareFlowAnalysisResponse } from './backendTypes'

export async function analyze(caseData: CareFlowCaseRequest): Promise<CareFlowAnalysisResponse> {
  return apiPost<CareFlowAnalysisResponse>('/api/repayment/analyze', caseData)
}

export async function optimize(caseData: CareFlowCaseRequest): Promise<CareFlowAnalysisResponse> {
  return apiPost<CareFlowAnalysisResponse>('/api/repayment/optimize', caseData)
}
