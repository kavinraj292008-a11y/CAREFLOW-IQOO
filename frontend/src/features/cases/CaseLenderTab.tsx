import { Link } from 'react-router-dom'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function CaseLenderTab() {
  return (
    <Card>
      <CardHeader title="Lender analysis" subtitle="View lender-facing restructuring metrics." />
      <p className="text-[13px] text-text-secondary mb-4 leading-relaxed">
        Lender analysis is derived from the optimization result. View it in the dedicated Lender Analysis page.
      </p>
      <Link to="/app/lender">
        <Button variant="secondary" size="sm">Open Lender Analysis</Button>
      </Link>
    </Card>
  )
}
