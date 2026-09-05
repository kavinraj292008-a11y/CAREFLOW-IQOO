import { useState } from 'react'
import type { RepaymentPeriod } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { formatINR } from '@/utils/format'
import { cn } from '@/utils/cn'

export function ExplanationPanel({ periods }: { periods: RepaymentPeriod[] }) {
  const changed = periods.filter((p) => p.careflowPayment !== p.traditionalPayment)
  const [activePeriod, setActivePeriod] = useState<number>(changed[0]?.period ?? periods[0]?.period)

  const active = periods.find((p) => p.period === activePeriod)

  return (
    <Card>
      <CardHeader title="Why did the schedule change?" />
      <div className="flex gap-2 mb-4 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.period}
            onClick={() => setActivePeriod(p.period)}
            className={cn(
              'text-[12px] px-2.5 py-1 rounded-sm border',
              activePeriod === p.period
                ? 'border-accent-teal/40 text-text-primary bg-white/[0.03]'
                : 'border-border text-text-secondary hover:text-text-primary',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {active && (
        <div className="space-y-3 text-[13px]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-text-muted">Treatment expense</p>
              <p className="text-stress-coral font-medium tabular-nums mt-0.5">{formatINR(active.medicalCost)}</p>
            </div>
            <div>
              <p className="text-text-muted">Available cash</p>
              <p className={cn('font-medium tabular-nums mt-0.5', active.availableCash < 0 ? 'text-stress-coral' : 'text-text-primary')}>
                {active.availableCash < 0 ? 'Negative / constrained' : formatINR(active.availableCash)}
              </p>
            </div>
          </div>
          <div>
            <p className="text-text-muted">CareFlow action</p>
            <p className="text-text-primary font-medium mt-0.5">
              {active.careflowPayment < active.traditionalPayment
                ? 'Reduced repayment'
                : active.careflowPayment > active.traditionalPayment
                  ? 'Increased repayment'
                  : 'No change'}
            </p>
          </div>
          <div>
            <p className="text-text-muted">Reason</p>
            <p className="text-text-secondary leading-relaxed mt-0.5">{active.changeReason}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
