// Adapters between backend DTOs and frontend display models.
import type { BackendStressLevel } from '@/services/api/backendTypes'
import type { StressLevel } from '@/types'

// Backend returns uppercase; frontend expects lowercase
export function normalizeStress(level: BackendStressLevel): StressLevel {
  return level.toLowerCase() as StressLevel
}

// Period number to "Month N" label
export function periodLabel(period: number): string {
  return `Month ${period}`
}
