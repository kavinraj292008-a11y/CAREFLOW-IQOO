import { useEffect, useState } from 'react'
import { treatmentApi } from '@/services/api'
import type { TreatmentPlan } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { TreatmentCostChart } from '@/components/charts/TreatmentCostChart'
import { TreatmentTimeline } from './TreatmentTimeline'
import { formatINR, formatPercent } from '@/utils/format'

export function TreatmentPage() {
  const [presets, setPresets] = useState<Record<string, TreatmentPlan>>({})
  const [selectedKey, setSelectedKey] = useState<string>('chemotherapy')
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>()

  useEffect(() => {
    treatmentApi.listPresets().then(setPresets)
  }, [])

  const plan = presets[selectedKey]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Treatment Model</h1>
        <p className="text-[14px] text-text-secondary mt-1">Model expected treatment cost and confidence over time.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(presets).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setSelectedKey(key)}
            className={`text-[13px] font-medium px-3.5 py-2 rounded-sm border transition-colors ${
              selectedKey === key
                ? 'border-accent-teal/40 bg-white/[0.03] text-text-primary'
                : 'border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {p.name}
          </button>
        ))}
        <button className="text-[13px] font-medium px-3.5 py-2 rounded-sm border border-border text-text-secondary hover:text-text-primary">
          Custom Treatment
        </button>
      </div>

      {plan && (
        <>
          <Card>
            <CardHeader
              title={plan.name}
              subtitle={`${plan.frequencyLabel} · ${plan.durationMonths} month duration · ${formatPercent(plan.confidence)} avg. confidence`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[13px] mb-2">
              <div>
                <p className="text-text-secondary">Duration</p>
                <p className="text-text-primary mt-0.5">{plan.durationMonths} months</p>
              </div>
              <div>
                <p className="text-text-secondary">Frequency</p>
                <p className="text-text-primary mt-0.5">{plan.frequencyLabel}</p>
              </div>
              <div>
                <p className="text-text-secondary">Expected total cost</p>
                <p className="text-text-primary mt-0.5 tabular-nums">
                  {formatINR(plan.phases.reduce((sum, p) => sum + p.expectedCost, 0))}
                </p>
              </div>
              <div>
                <p className="text-text-secondary">Status</p>
                <p className="text-text-primary mt-0.5 capitalize">{plan.status}</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Treatment timeline" />
            <TreatmentTimeline phases={plan.phases} selected={selectedPeriod} onSelect={setSelectedPeriod} />
          </Card>

          <Card>
            <CardHeader title="Treatment cost chart" />
            <TreatmentCostChart
              data={plan.phases.map((p) => ({
                period: p.period,
                label: p.label,
                expectedCost: p.expectedCost,
                lowerBound: p.lowerBound,
                upperBound: p.upperBound,
              }))}
            />
          </Card>
        </>
      )}
    </div>
  )
}
