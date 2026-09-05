import { useEffect, useState } from 'react'
import { casesApi } from '@/services/api'
import type { CaseActivity } from '@/types'
import { Card, CardHeader } from '@/components/ui/Card'

export function CaseActivityTab({ caseId }: { caseId: string }) {
  const [activity, setActivity] = useState<CaseActivity[]>([])

  useEffect(() => {
    casesApi.getActivity(caseId).then(setActivity)
  }, [caseId])

  return (
    <Card>
      <CardHeader title="Activity" subtitle="Recent system and reviewer actions on this case." />
      <div className="space-y-4">
        {activity.map((a) => (
          <div key={a.id} className="flex gap-4 text-[13px]">
            <div className="w-28 shrink-0 text-text-muted">{new Date(a.timestamp).toLocaleDateString()}</div>
            <div>
              <p className="text-text-primary">{a.description}</p>
              <p className="text-text-muted text-[12px] mt-0.5">{a.actor}</p>
            </div>
          </div>
        ))}
        {activity.length === 0 && <p className="text-[13px] text-text-secondary">No activity recorded yet.</p>}
      </div>
    </Card>
  )
}
