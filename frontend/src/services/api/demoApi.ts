import { apiGet } from './client'
import type { DemoCaseResponse, HealthResponse } from './backendTypes'

export async function getHealth(): Promise<HealthResponse> {
  return apiGet<HealthResponse>('/health')
}

export async function getDemoCase(): Promise<DemoCaseResponse> {
  return apiGet<DemoCaseResponse>('/api/demo-case')
}
