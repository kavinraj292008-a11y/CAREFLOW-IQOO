import { useState } from 'react'
import type { RepaymentPeriod } from '@/types'
import { Badge, stressTone } from '@/components/ui/Badge'
import { formatINR, stressLabel } from '@/utils/format'
import { ChevronDown, ChevronRight } from 'lucide-react'

export function RepaymentTable({ periods }: { periods: RepaymentPeriod[] }) {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-[13px] min-w-[760px]">
        <thead>
          <tr className="text-left text-text-muted border-b border-border">
            <th className="py-2 font-medium w-8" />
            <th className="py-2 font-medium">Period</th>
            <th className="py-2 font-medium">Medical cost</th>
            <th className="py-2 font-medium">Traditional</th>
            <th className="py-2 font-medium">CareFlow</th>
            <th className="py-2 font-medium">Available cash</th>
            <th className="py-2 font-medium">Stress</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => (
            <>
              <tr
                key={p.period}
                className="border-b border-border/60 hover:bg-white/[0.02] cursor-pointer"
                onClick={() => setExpanded(expanded === p.period ? null : p.period)}
              >
                <td className="py-2.5 text-text-muted">
                  {expanded === p.period ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </td>
                <td className="py-2.5 font-medium text-text-primary">{p.label}</td>
                <td className="py-2.5 text-stress-coral tabular-nums">{formatINR(p.medicalCost)}</td>
                <td className="py-2.5 text-text-secondary tabular-nums">{formatINR(p.traditionalPayment)}</td>
                <td className="py-2.5 text-accent-tealLight font-medium tabular-nums">{formatINR(p.careflowPayment)}</td>
                <td className={`py-2.5 tabular-nums ${p.availableCash < 0 ? 'text-stress-coral' : 'text-text-secondary'}`}>
                  {formatINR(p.availableCash)}
                </td>
                <td className="py-2.5">
                  <Badge tone={stressTone(p.stress)}>{stressLabel[p.stress]}</Badge>
                </td>
              </tr>
              {expanded === p.period && (
                <tr className="bg-white/[0.015] border-b border-border/60">
                  <td colSpan={7} className="px-2 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] mb-3">
                      <div>
                        <p className="text-text-muted">Beginning balance</p>
                        <p className="text-text-primary tabular-nums mt-0.5">{formatINR(p.beginningBalance)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Interest</p>
                        <p className="text-text-primary tabular-nums mt-0.5">{formatINR(p.interest)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Principal</p>
                        <p className="text-text-primary tabular-nums mt-0.5">{formatINR(p.principal)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Ending balance</p>
                        <p className="text-text-primary tabular-nums mt-0.5">{formatINR(p.endingBalance)}</p>
                      </div>
                    </div>
                    {p.changeReason && (
                      <p className="text-[12px] text-text-secondary leading-relaxed border-t border-border pt-2">
                        {p.changeReason}
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
