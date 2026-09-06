import { useState } from 'react'
import type { ExplanationDto } from '@/services/api/backendTypes'
import { Card, CardHeader } from '@/components/ui/Card'
import { periodLabel } from '@/utils/adapters'
import { cn } from '@/utils/cn'

export function ExplanationPanel({ explanations }: { explanations: ExplanationDto[] }) {
  const [activePeriod, setActivePeriod] = useState<number>(explanations[0]?.period ?? 1)

  const uniquePeriods = [...new Set(explanations.map((e) => e.period))].sort((a, b) => a - b)
  const active = explanations.filter((e) => e.period === activePeriod)

  if (explanations.length === 0) return null

  return (
    <Card>
      <CardHeader title="Optimization decisions by period" subtitle="Deterministic schedule explanations from the financial engine." />
      <div className="flex gap-2 mb-4 flex-wrap">
        {uniquePeriods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={cn(
              'text-[12px] px-2.5 py-1 rounded-sm border',
              activePeriod === period
                ? 'border-accent-teal/40 text-text-primary bg-white/[0.03]'
                : 'border-border text-text-secondary hover:text-text-primary',
            )}
          >
            {periodLabel(period)}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {active.map((exp, i) => (
          <div key={i} className="border-l-2 border-accent-teal/30 pl-3">
            <p className="text-[11px] text-text-muted mb-0.5 uppercase tracking-wide">{exp.explanation_type}</p>
            <p className="text-[13px] text-text-secondary leading-relaxed">{exp.message}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
