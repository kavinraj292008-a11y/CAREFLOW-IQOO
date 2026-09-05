import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function CaseSimulationTab() {
  return (
    <Card>
      <CardHeader title="Treatment change simulator" subtitle="Test how this case responds to a treatment event." />
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
        Run the full simulator to add a treatment cycle, an unexpected expense, a delay, or a
        frequency change, and see the re-optimized schedule for this case.
      </p>
      <Link to="/app/simulation">
        <Button variant="primary" size="sm">Open Simulator</Button>
      </Link>
    </Card>
  )
}
