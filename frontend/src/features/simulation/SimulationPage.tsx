import { useState } from 'react'
import { useSimulationStore } from '@/stores/simulationStore'
import { demoCase } from '@/services/mock/demoData'
import type { SimulationEventType } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { cn } from '@/utils/cn'

const eventTypes: { key: SimulationEventType; label: string }[] = [
  { key: 'add_cycle', label: 'Add treatment cycle' },
  { key: 'unexpected_expense', label: 'Add unexpected expense' },
  { key: 'delay_treatment', label: 'Delay treatment' },
  { key: 'increase_frequency', label: 'Increase treatment frequency' },
]

export function SimulationPage() {
  const { result, isSimulating, applyEvent, reset } = useSimulationStore()
  const [eventType, setEventType] = useState<SimulationEventType>('add_cycle')
  const [additionalCost, setAdditionalCost] = useState(75000)
  const [targetPeriod, setTargetPeriod] = useState(7)
  const [delayMonths, setDelayMonths] = useState(1)

  function handleApply() {
    applyEvent(demoCase.id, {
      id: `evt-${Date.now()}`,
      type: eventType,
      label: eventTypes.find((e) => e.key === eventType)?.label ?? eventType,
      additionalCost: eventType === 'add_cycle' || eventType === 'unexpected_expense' ? additionalCost : undefined,
      targetPeriod: eventType === 'add_cycle' || eventType === 'unexpected_expense' ? targetPeriod : undefined,
      delayMonths: eventType === 'delay_treatment' ? delayMonths : undefined,
    })
  }

  const originalData = result?.originalSchedule.periods.map((p) => ({
    label: p.label,
    treatment: p.medicalCost,
    traditional: p.traditionalPayment,
    careflow: p.careflowPayment,
  }))
  const updatedData = result?.updatedSchedule.periods.map((p) => ({
    label: p.label,
    treatment: p.medicalCost,
    traditional: p.traditionalPayment,
    careflow: p.careflowPayment,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Treatment Change Simulator</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Test how the repayment plan responds when treatment circumstances change.
        </p>
      </div>

      <Card>
        <CardHeader title="Simulation flow" />
        <div className="flex items-center gap-2 text-[12px] text-text-secondary overflow-x-auto pb-1">
          {['Current plan', 'Treatment event', 'Updated cost curve', 'Re-optimization', 'New plan'].map((step, i, arr) => (
            <div key={step} className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-sm border',
                  result && i <= 1 ? 'border-accent-teal/40 text-text-primary bg-white/[0.03]' : 'border-border',
                )}
              >
                {step}
              </span>
              {i < arr.length - 1 && <span className="text-text-muted">→</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Add a simulation event" />
        <div className="flex flex-wrap gap-2 mb-4">
          {eventTypes.map((e) => (
            <button
              key={e.key}
              onClick={() => setEventType(e.key)}
              className={cn(
                'text-[13px] font-medium px-3.5 py-2 rounded-sm border',
                eventType === e.key
                  ? 'border-accent-teal/40 bg-white/[0.03] text-text-primary'
                  : 'border-border text-text-secondary hover:text-text-primary',
              )}
            >
              {e.label}
            </button>
          ))}
        </div>

        {(eventType === 'add_cycle' || eventType === 'unexpected_expense') && (
          <div className="grid sm:grid-cols-2 gap-4 mb-4 max-w-md">
            <label className="text-[12px] text-text-secondary">
              Additional cost
              <input
                type="number"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(Number(e.target.value))}
                className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
              />
            </label>
            <label className="text-[12px] text-text-secondary">
              Target period
              <input
                type="number"
                value={targetPeriod}
                onChange={(e) => setTargetPeriod(Number(e.target.value))}
                className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
              />
            </label>
          </div>
        )}

        {eventType === 'delay_treatment' && (
          <label className="text-[12px] text-text-secondary block mb-4 max-w-xs">
            Delay (months)
            <input
              type="number"
              value={delayMonths}
              onChange={(e) => setDelayMonths(Number(e.target.value))}
              className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
            />
          </label>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleApply} disabled={isSimulating}>
            Apply Event
          </Button>
          <Button variant="primary" onClick={handleApply} disabled={isSimulating}>
            {isSimulating ? 'Re-optimizing…' : 'Re-optimize'}
          </Button>
          {result && (
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {result && originalData && updatedData && (
        <>
          <p className="text-[13px] text-text-secondary panel px-4 py-3">
            Completed periods remain unchanged. Only the remaining repayment schedule is re-optimized.
          </p>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Original plan" />
              <RepaymentComparisonChart data={originalData} height={280} />
            </Card>
            <Card>
              <CardHeader title={`Updated plan — ${result.event.label}`} />
              <RepaymentComparisonChart data={updatedData} height={280} />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
