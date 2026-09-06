import { apiPost } from './client'
import type { ReplanRequestDto, ReplanResultDto } from './backendTypes'

export async function replan(request: ReplanRequestDto): Promise<ReplanResultDto> {
  return apiPost<ReplanResultDto>('/api/simulation/replan', request)
}
