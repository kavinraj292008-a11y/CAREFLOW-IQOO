import { useEffect, useMemo, useState } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, stressTone } from '@/components/ui/Badge'
import { formatINR, stressLabel } from '@/utils/format'

type SortKey = 'outstanding' | 'stress' | 'lastUpdated'

const stressOrder: Record<string, number> = { low: 0, moderate: 1, high: 2, critical: 3 }

export function CasesListPage() {
  const { cases, loadCases } = useCaseStore()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stressFilter, setStressFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('lastUpdated')

  useEffect(() => {
    loadCases()
  }, [loadCases])

  const filtered = useMemo(() => {
    let result = cases.filter((c) =>
      `${c.id} ${c.patientLabel} ${c.treatment.name}`.toLowerCase().includes(query.toLowerCase()),
    )
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter)
    if (stressFilter !== 'all') result = result.filter((c) => c.projectedStress === stressFilter)

    result = [...result].sort((a, b) => {
      if (sortKey === 'outstanding') return b.outstanding - a.outstanding
      if (sortKey === 'stress') return stressOrder[b.projectedStress] - stressOrder[a.projectedStress]
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    })
    return result
  }, [cases, query, statusFilter, stressFilter, sortKey])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Cases</h1>
        <p className="text-[14px] text-text-secondary mt-1">All active and recently closed CareFlow cases.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-sm px-3 py-2 flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by case, patient, or treatment"
            className="bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-secondary outline-none"
        >
          <option value="all">All statuses</option>
          <option value="stable">Stable</option>
          <option value="review">Review</option>
          <option value="replan">Replan</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={stressFilter}
          onChange={(e) => setStressFilter(e.target.value)}
          className="bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-secondary outline-none"
        >
          <option value="all">All stress levels</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="bg-surface border border-border rounded-sm px-3 py-2 text-[13px] text-text-secondary outline-none"
        >
          <option value="lastUpdated">Sort: Last updated</option>
          <option value="outstanding">Sort: Outstanding</option>
          <option value="stress">Sort: Stress</option>
        </select>
      </div>

      <Card>
        <CardHeader title={`${filtered.length} case${filtered.length === 1 ? '' : 's'}`} />
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-[13px] min-w-[880px]">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="py-2 font-medium">Case ID</th>
                <th className="py-2 font-medium">Treatment</th>
                <th className="py-2 font-medium">Phase</th>
                <th className="py-2 font-medium">Outstanding</th>
                <th className="py-2 font-medium">Current payment</th>
                <th className="py-2 font-medium">Stress</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Updated</th>
                <th className="py-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/60 hover:bg-white/[0.02]">
                  <td className="py-2.5 font-medium text-text-primary">{c.id}</td>
                  <td className="py-2.5 text-text-secondary">{c.treatment.name.replace(' Demo', '')}</td>
                  <td className="py-2.5 text-text-secondary">{c.currentPhaseLabel}</td>
                  <td className="py-2.5 text-text-primary tabular-nums">{formatINR(c.outstanding)}</td>
                  <td className="py-2.5 text-text-secondary tabular-nums">{formatINR(c.currentPayment)}</td>
                  <td className="py-2.5">
                    <Badge tone={stressTone(c.projectedStress)}>{stressLabel[c.projectedStress]}</Badge>
                  </td>
                  <td className="py-2.5 text-text-secondary capitalize">{c.status}</td>
                  <td className="py-2.5 text-text-muted">{new Date(c.lastUpdated).toLocaleDateString()}</td>
                  <td className="py-2.5 text-right space-x-3 whitespace-nowrap">
                    <Link to={`/app/cases/${c.id}`} className="text-accent-tealLight hover:underline">
                      Open
                    </Link>
                    <Link to={`/app/repayment`} className="text-text-secondary hover:text-text-primary hover:underline">
                      Simulate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
