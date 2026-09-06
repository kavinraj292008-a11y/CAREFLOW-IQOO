import { Card, CardHeader } from '@/components/ui/Card'

// AI assistant is a planned feature — not implemented in this prototype.
// The optimization engine is deterministic OR-Tools linear programming, not AI.
export function AssistantPanel() {
  return (
    <Card>
      <CardHeader title="AI Assistant" subtitle="Planned feature — not available in prototype." />
      <p className="text-[13px] text-text-muted leading-relaxed">
        The CareFlow optimization engine uses deterministic linear programming (OR-Tools), not AI.
        An AI assistant is planned for a future release.
      </p>
    </Card>
  )
}
