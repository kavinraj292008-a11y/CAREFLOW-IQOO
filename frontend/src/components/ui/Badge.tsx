import { cn } from '@/utils/cn'

type Tone = 'neutral' | 'teal' | 'coral' | 'amber' | 'muted'

const toneClasses: Record<Tone, string> = {
  neutral: 'text-text-secondary bg-white/[0.04] border-border',
  teal: 'text-accent-tealLight bg-accent-teal/10 border-accent-teal/25',
  coral: 'text-stress-coral bg-stress-coral/10 border-stress-coral/25',
  amber: 'text-stress-amber bg-stress-amber/10 border-stress-amber/25',
  muted: 'text-text-muted bg-white/[0.02] border-border',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[12px] font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function stressTone(stress: string): Tone {
  if (stress === 'critical' || stress === 'high') return stress === 'critical' ? 'coral' : 'amber'
  if (stress === 'moderate') return 'amber'
  return 'neutral'
}
