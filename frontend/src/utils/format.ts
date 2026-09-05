export function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCompactINR(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value}`
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

export const stressColor: Record<string, string> = {
  low: '#9AA8B8',
  moderate: '#E8AD55',
  high: '#E8AD55',
  critical: '#F06C6C',
}

export const stressLabel: Record<string, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
}
