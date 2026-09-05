import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { formatCompactINR } from '@/utils/format'
import type { TreatmentCostPoint } from '@/types'

export function TreatmentCostChart({ data, height = 300 }: { data: TreatmentCostPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="treatmentFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F06C6C" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#F06C6C" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#66768A', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompactINR(v)} tick={{ fill: '#66768A', fontSize: 12 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip
          contentStyle={{ background: '#162437', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#F5F7FA' }}
          formatter={(value: number) => formatCompactINR(value)}
        />
        <Area type="monotone" dataKey="expectedCost" name="Expected cost" stroke="#F06C6C" strokeWidth={2} fill="url(#treatmentFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
