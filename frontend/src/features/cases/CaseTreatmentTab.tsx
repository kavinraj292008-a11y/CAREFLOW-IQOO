import { useEffect, useState } from 'react'
import { treatmentApi } from '@/services/api'
import type { TreatmentPlan } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'
import { TreatmentCostChart } from '@/components/charts/TreatmentCostChart'
import { Badge, stressTone } from '@/components/ui/Badge'
import { stressLabel, formatINR } from '@/utils/format'

export function CaseTreatmentTab({ caseId }: { caseId: string }) {
  const [plan, setPlan] = useState<TreatmentPlan | null>(null)

  useEffect(() => {
    treatmentApi.getPlan(caseId).then(setPlan)
  }, [caseId])

  if (!plan) return null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={plan.name} subtitle={`${plan.frequencyLabel} · ${plan.durationMonths} month horizon`} />
        <TreatmentCostChart data={plan.phases.map((p) => ({ period: p.period, label: p.label, expectedCost: p.expectedCost }))} />
      </Card>

      <Card>
        <CardHeader title="Treatment phases" />
        <div className="flex flex-wrap gap-3">
          {plan.phases.map((phase, i) => (
            <div key={phase.id} className="flex items-center">
              <div className="panel px-4 py-3 min-w-[110px]">
                <p className="text-[11px] text-text-muted">{phase.label}</p>
                <p className="text-[15px] font-semibold text-text-primary mt-1 tabular-nums">{formatINR(phase.expectedCost)}</p>
                <Badge tone={stressTone(phase.status)} className="mt-2">
                  {stressLabel[phase.status]}
                </Badge>
              </div>
              {i < plan.phases.length - 1 && <span className="text-text-muted px-2">→</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
