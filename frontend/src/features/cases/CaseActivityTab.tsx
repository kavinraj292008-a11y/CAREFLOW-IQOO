import { Card, CardHeader } from '@/components/ui/Card'

const DEMO_ACTIVITY = [
  { id: '1', timestamp: '2024-01-15T10:00:00Z', actor: 'System', description: 'Demo case loaded from /api/demo-case.' },
  { id: '2', timestamp: '2024-01-15T10:01:00Z', actor: 'System', description: 'Repayment optimization completed via POST /api/repayment/optimize.' },
]

export function CaseActivityTab() {
  return (
    <Card>
      <CardHeader title="Prototype activity" subtitle="Activity is not persisted — this is a static demo log." />
      <div className="space-y-4">
        {DEMO_ACTIVITY.map((a) => (
          <div key={a.id} className="flex gap-4 text-[13px]">
            <div className="w-28 shrink-0 text-text-muted">{new Date(a.timestamp).toLocaleDateString()}</div>
            <div>
              <p className="text-text-primary">{a.description}</p>
              <p className="text-text-muted text-[12px] mt-0.5">{a.actor}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
