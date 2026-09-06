import { useEffect, useState } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { useRepaymentStore } from '@/stores/repaymentStore'
import { useSimulationStore } from '@/stores/simulationStore'
import type { SimulationEventDto, SimulationEventType } from '@/services/api/backendTypes'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RepaymentComparisonChart } from '@/components/charts/RepaymentComparisonChart'
import { formatINR } from '@/utils/format'
import { normalizeStress, periodLabel } from '@/utils/adapters'
import { cn } from '@/utils/cn'
import { AlertCircle, Loader2, Lock } from 'lucide-react'

type UiEventType = 'additional_cycle' | 'additional_expense' | 'treatment_delay'

const eventDefs: { key: UiEventType; label: string; backendType: SimulationEventType }[] = [
  { key: 'additional_cycle', label: 'Add treatment cycle', backendType: 'additional_cycle' },
  { key: 'additional_expense', label: 'Add unexpected expense', backendType: 'additional_expense' },
  { key: 'treatment_delay', label: 'Delay treatment', backendType: 'treatment_delay' },
]

export function SimulationPage() {
  const { caseData, caseName, loadDemoCase } = useCaseStore()
  const { result: optResult, runOptimization } = useRepaymentStore()
  const { result, isSimulating, error, replan, reset, clearError } = useSimulationStore()

  const [eventType, setEventType] = useState<UiEventType>('additional_cycle')
  const [additionalCost, setAdditionalCost] = useState(75000)
  const [targetPeriod, setTargetPeriod] = useState(7)
  const [sourcePeriod, setSourcePeriod] = useState(4)
  const [delayPeriods, setDelayPeriods] = useState(1)
  const [completedPeriods, setCompletedPeriods] = useState(0)

  // How many periods exist in current optimization result
  const totalPeriods = optResult?.traditional.schedule.length ?? 12

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  useEffect(() => {
    if (caseData && !optResult) runOptimization(caseData)
  }, [caseData, optResult, runOptimization])

  function buildEvent(): SimulationEventDto {
    const def = eventDefs.find((e) => e.key === eventType)!
    if (eventType === 'treatment_delay') {
      return {
        event_type: def.backendType,
        source_period: sourcePeriod,
        delay_periods: delayPeriods,
        description: def.label,
      }
    }
    return {
      event_type: def.backendType,
      target_period: targetPeriod,
      additional_cost: additionalCost,
      description: def.label,
    }
  }

  function handleApply() {
    if (!caseData) return
    clearError()
    const completedPayments =
      completedPeriods > 0 && optResult
        ? optResult.careflow.schedule.slice(0, completedPeriods).map((p) => p.payment)
        : Array(completedPeriods).fill(0)

    replan(caseData, completedPeriods, completedPayments, buildEvent())
  }

  const maxPeriod = result
    ? Math.max(...result.full_schedule.map((p) => p.period))
    : 0

  const chartFull = result?.full_schedule.map((p) => ({
    label: periodLabel(p.period),
    treatment: p.medical_expense,
    traditional: 0,
    careflow: p.payment,
    frozen: p.is_completed,
  })) ?? []

  const chartOriginal = optResult?.careflow.schedule.map((p) => ({
    label: periodLabel(p.period),
    treatment: p.medical_expense,
    traditional: optResult.traditional.schedule.find((t) => t.period === p.period)?.payment ?? 0,
    careflow: p.payment,
  })) ?? []

  if (!caseData) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Treatment Change Simulator</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Test how the repayment plan responds when treatment circumstances change mid-course.
        </p>
      </div>

      <Card>
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
        <CardHeader title="Simulation parameters" />
        <div className="mb-4">
          <p className="text-[12px] text-text-secondary mb-1.5">Completed periods (frozen in re-optimization)</p>
          <input
            type="number"
            min={0}
            max={totalPeriods - 1}
            value={completedPeriods}
            onChange={(e) => setCompletedPeriods(Math.max(0, Math.min(totalPeriods - 1, Number(e.target.value))))}
            className="w-28 bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
          />
        </div>

        <CardHeader title="Treatment event" />
        <div className="flex flex-wrap gap-2 mb-4">
          {eventDefs.map((e) => (
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

        {(eventType === 'additional_cycle' || eventType === 'additional_expense') && (
          <div className="grid sm:grid-cols-2 gap-4 mb-4 max-w-md">
            <label className="text-[12px] text-text-secondary">
              Additional cost (₹)
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
                min={completedPeriods + 1}
                value={targetPeriod}
                onChange={(e) => setTargetPeriod(Number(e.target.value))}
                className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
              />
            </label>
          </div>
        )}

        {eventType === 'treatment_delay' && (
          <div className="grid sm:grid-cols-2 gap-4 mb-4 max-w-md">
            <label className="text-[12px] text-text-secondary">
              Source period
              <input
                type="number"
                min={completedPeriods + 1}
                value={sourcePeriod}
                onChange={(e) => setSourcePeriod(Number(e.target.value))}
                className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
              />
            </label>
            <label className="text-[12px] text-text-secondary">
              Delay (periods)
              <input
                type="number"
                min={1}
                value={delayPeriods}
                onChange={(e) => setDelayPeriods(Number(e.target.value))}
                className="mt-1.5 w-full bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-primary outline-none"
              />
            </label>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="primary" onClick={handleApply} disabled={isSimulating || !optResult}>
            {isSimulating ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Re-optimizing...</span>
            ) : (
              'Run Simulation'
            )}
          </Button>
          {result && (
            <Button variant="ghost" onClick={reset}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-stress-coral mt-0.5 shrink-0" />
            <p className="text-[13px] text-text-secondary">{error}</p>
          </div>
        </Card>
      )}

      {result && (
        <>
          <div className="bg-elevated border border-border/60 rounded px-4 py-3 text-[13px] text-text-secondary">
            Completed periods remain unchanged. Only the remaining repayment schedule is re-optimized.
          </div>

          {result.replan_status === 'infeasible' && (
            <Card>
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-stress-coral mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] font-medium text-text-primary">Re-optimization infeasible under current constraints</p>
                  {result.infeasibility_reason && (
                    <p className="text-[13px] text-text-secondary mt-1">{result.infeasibility_reason}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader title="Original plan" />
              <RepaymentComparisonChart data={chartOriginal} height={280} />
            </Card>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <CardHeader title="Updated plan" />
                <Badge tone={result.replan_status === 'infeasible' ? 'coral' : 'teal'}>
                  {result.replan_status}
                </Badge>
              </div>
              <RepaymentComparisonChart data={chartFull} height={280} />
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-[12px] text-text-secondary">Balance at replan</p>
              <p className="text-[20px] font-semibold text-text-primary tabular-nums mt-2">
                {formatINR(result.balance_at_replan)}
              </p>
            </Card>
            <Card>
              <p className="text-[12px] text-text-secondary">Peak projected deficit</p>
              <p className="text-[20px] font-semibold text-stress-coral tabular-nums mt-2">
                {formatINR(result.new_metrics.peak_deficit)}
              </p>
            </Card>
            <Card>
              <p className="text-[12px] text-text-secondary">High-stress periods</p>
              <p className="text-[20px] font-semibold text-text-primary tabular-nums mt-2">
                {result.new_metrics.high_stress_periods}
              </p>
            </Card>
            <Card>
              <p className="text-[12px] text-text-secondary">Extension periods</p>
              <p className="text-[20px] font-semibold text-text-primary tabular-nums mt-2">
                {result.new_metrics.extension_periods}
              </p>
            </Card>
          </div>

          {result.completed_schedule.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Lock size={14} className="text-text-muted" />
                <p className="text-[13px] font-medium text-text-muted">Frozen completed periods ({result.completed_schedule.length})</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] min-w-[480px]">
                  <thead>
                    <tr className="text-text-muted border-b border-border">
                      <th className="py-1.5 font-medium text-left">Period</th>
                      <th className="py-1.5 font-medium text-right">Payment</th>
                      <th className="py-1.5 font-medium text-right">Medical</th>
                      <th className="py-1.5 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.completed_schedule.map((p) => (
                      <tr key={p.period} className="border-b border-border/50 opacity-70">
                        <td className="py-1.5 text-text-secondary">{periodLabel(p.period)}</td>
                        <td className="py-1.5 text-text-primary tabular-nums text-right">{formatINR(p.payment)}</td>
                        <td className="py-1.5 text-stress-coral tabular-nums text-right">{formatINR(p.medical_expense)}</td>
                        <td className="py-1.5 text-right"><Badge tone="teal" className="text-[10px]">Completed</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {result.new_future_schedule.length > 0 && (
            <Card>
              <CardHeader title="Re-optimized future schedule" />
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] min-w-[560px]">
                  <thead>
                    <tr className="text-text-muted border-b border-border">
                      <th className="py-1.5 font-medium text-left">Period</th>
                      <th className="py-1.5 font-medium text-right">Payment</th>
                      <th className="py-1.5 font-medium text-right">Medical</th>
                      <th className="py-1.5 font-medium text-right">Cashflow after</th>
                      <th className="py-1.5 font-medium text-right">Stress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.new_future_schedule.map((p) => {
                      const stress = normalizeStress(p.stress_level)
                      return (
                        <tr key={p.period} className="border-b border-border/50">
                          <td className="py-1.5 text-text-primary font-medium">{periodLabel(p.period)}</td>
                          <td className="py-1.5 text-accent-tealLight tabular-nums text-right">{formatINR(p.payment)}</td>
                          <td className="py-1.5 text-stress-coral tabular-nums text-right">{formatINR(p.medical_expense)}</td>
                          <td className={`py-1.5 tabular-nums text-right ${p.cashflow_after_payment < 0 ? 'text-stress-coral' : 'text-text-secondary'}`}>
                            {formatINR(p.cashflow_after_payment)}
                          </td>
                          <td className="py-1.5 text-right">
                            <Badge tone={stress === 'critical' ? 'coral' : stress === 'high' ? 'amber' : 'teal'}>
                              {stress}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {result.explanations.length > 0 && (
            <Card>
              <CardHeader title="Re-optimization explanations" />
              <div className="space-y-2 mt-2">
                {result.explanations.map((exp, i) => (
                  <div key={i} className="border-l-2 border-accent-teal/30 pl-3">
                    <p className="text-[11px] text-text-muted mb-0.5">{periodLabel(exp.period)} · {exp.explanation_type}</p>
                    <p className="text-[13px] text-text-secondary">{exp.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
