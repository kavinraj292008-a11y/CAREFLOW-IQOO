import { Link } from 'react-router-dom'
import type { Case } from '@/types'
import { Badge, stressTone } from '@/components/ui/Badge'
import { formatINR } from '@/utils/format'
import { stressLabel } from '@/utils/format'

const statusLabel: Record<string, string> = {
  stable: 'Stable',
  review: 'Review',
  replan: 'Replan',
  closed: 'Closed',
}

export function CasesTable({ cases, compact = false }: { cases: Case[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-[13px] min-w-[720px]">
        <thead>
          <tr className="text-left text-text-muted border-b border-border">
            <th className="py-2 font-medium">Case ID</th>
            <th className="py-2 font-medium">Treatment</th>
            <th className="py-2 font-medium">Phase</th>
            <th className="py-2 font-medium">Outstanding</th>
            {!compact && <th className="py-2 font-medium">Stress</th>}
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id} className="border-b border-border/60 hover:bg-white/[0.02]">
              <td className="py-2.5 font-medium text-text-primary">{c.id}</td>
              <td className="py-2.5 text-text-secondary">{c.treatment.name.replace(' Demo', '')}</td>
              <td className="py-2.5 text-text-secondary">{c.currentPhaseLabel}</td>
              <td className="py-2.5 text-text-primary tabular-nums">{formatINR(c.outstanding)}</td>
              {!compact && (
                <td className="py-2.5">
                  <Badge tone={stressTone(c.projectedStress)}>{stressLabel[c.projectedStress]}</Badge>
                </td>
              )}
              <td className="py-2.5">
                <Badge tone="muted">{statusLabel[c.status]}</Badge>
              </td>
              <td className="py-2.5 text-right">
                <Link to={`/app/cases/${c.id}`} className="text-accent-tealLight hover:underline">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
