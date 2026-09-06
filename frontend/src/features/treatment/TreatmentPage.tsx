import { useEffect } from 'react'
import { useCaseStore } from '@/stores/caseStore'
import { Card, CardHeader } from '@/components/ui/Card'
import { TreatmentCostChart } from '@/components/charts/TreatmentCostChart'
import { formatINR } from '@/utils/format'
import { periodLabel } from '@/utils/adapters'
import { Loader2, AlertCircle } from 'lucide-react'

export function TreatmentPage() {
  const { caseData, caseName, isLoading, error, loadDemoCase } = useCaseStore()

  useEffect(() => {
    if (!caseData) loadDemoCase()
  }, [caseData, loadDemoCase])

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-8 text-text-secondary">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading treatment data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-stress-coral mt-0.5" />
          <p className="text-[13px] text-text-secondary">{error}</p>
        </div>
      </Card>
    )
  }

  if (!caseData) return null

  const costs = caseData.treatment_costs
  const chartData = costs.map((cost, i) => ({
    period: i + 1,
    label: periodLabel(i + 1),
    expectedCost: cost,
  }))

  const totalTreatmentCost = costs.reduce((a, b) => a + b, 0)
  const maxCost = Math.max(...costs)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold text-text-primary">Treatment Timeline</h1>
        <p className="text-[14px] text-text-secondary mt-1">
          Illustrative synthetic treatment timeline derived from the canonical demo case.
        </p>
      </div>

      <Card>
        <CardHeader title={caseName} subtitle="Illustrative synthetic treatment timeline — not medical advice." />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px]">
          <div>
            <p className="text-text-secondary">Treatment periods</p>
            <p className="text-text-primary font-medium mt-1">{costs.length} months</p>
          </div>
          <div>
            <p className="text-text-secondary">Total treatment cost</p>
            <p className="text-stress-coral font-medium tabular-nums mt-1">{formatINR(totalTreatmentCost)}</p>
          </div>
          <div>
            <p className="text-text-secondary">Peak single-period cost</p>
            <p className="text-stress-coral font-medium tabular-nums mt-1">{formatINR(maxCost)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Treatment cost curve" subtitle="Expected cost per period. Irregularity drives cashflow stress." />
        <TreatmentCostChart data={chartData} height={300} />
      </Card>

      <Card>
        <CardHeader title="Period breakdown" />
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-text-muted border-b border-border">
                <th className="py-2 font-medium">Period</th>
                <th className="py-2 font-medium text-right">Expected cost</th>
                <th className="py-2 font-medium text-right">% of total</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr key={row.period} className="border-b border-border/60">
                  <td className="py-2 text-text-primary">{row.label}</td>
                  <td className="py-2 text-stress-coral tabular-nums text-right">{formatINR(row.expectedCost)}</td>
                  <td className="py-2 text-text-secondary tabular-nums text-right">
                    {((row.expectedCost / totalTreatmentCost) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <p className="text-[12px] text-text-muted leading-relaxed">
          Phase names, confidence intervals, and clinical statuses are not available in this prototype.
          This timeline is derived from the /api/demo-case endpoint and shows expected costs per period only.
        </p>
      </Card>
    </div>
  )
}
