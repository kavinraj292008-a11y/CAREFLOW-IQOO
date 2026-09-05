import type { TreatmentPhase } from '@/types'
import { Badge, stressTone } from '@/components/ui/Badge'
import { stressLabel, formatCompactINR } from '@/utils/format'
import { cn } from '@/utils/cn'

export function TreatmentTimeline({ phases, selected, onSelect }: { phases: TreatmentPhase[]; selected?: number; onSelect?: (period: number) => void }) {
  return (
    <div className="flex items-stretch gap-1 overflow-x-auto pb-2">
      {phases.map((phase, i) => (
        <div key={phase.id} className="flex items-center">
          <button
            onClick={() => onSelect?.(phase.period)}
            className={cn(
              'panel px-4 py-3 min-w-[120px] text-left transition-colors',
              selected === phase.period ? 'border-accent-teal/40 bg-white/[0.03]' : 'hover:bg-white/[0.02]',
            )}
          >
            <p className="text-[11px] text-text-muted uppercase tracking-wide">{phase.label}</p>
            <p className="text-[16px] font-semibold text-text-primary mt-1">{formatCompactINR(phase.expectedCost)}</p>
            <Badge tone={stressTone(phase.status)} className="mt-2">
              {stressLabel[phase.status]}
            </Badge>
          </button>
          {i < phases.length - 1 && <span className="text-text-muted px-1.5">→</span>}
        </div>
      ))}
    </div>
  )
}
