import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatCompactINR } from '@/utils/format'
import type { CashflowPoint } from '@/types'

export function CashflowChart({ data, height = 300 }: { data: CashflowPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#66768A', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompactINR(v)} tick={{ fill: '#66768A', fontSize: 12 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip
          contentStyle={{ background: '#162437', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#F5F7FA' }}
          formatter={(value: number) => formatCompactINR(value)}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9AA8B8' }} />
        <Bar dataKey="treatmentExpenses" name="Treatment" fill="#F06C6C" fillOpacity={0.7} radius={[3, 3, 0, 0]} />
        <Bar dataKey="repayment" name="Repayment" fill="#16C7B7" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
        <Bar dataKey="remainingCash" name="Remaining cash" fill="#9AA8B8" fillOpacity={0.5} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
