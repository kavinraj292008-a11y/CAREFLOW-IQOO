import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import type { PortfolioStressPoint } from '@/types'

export function PortfolioStressChart({ data, height = 260 }: { data: PortfolioStressPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#66768A', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis tick={{ fill: '#66768A', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
        <Tooltip
          contentStyle={{ background: '#162437', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#F5F7FA' }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9AA8B8' }} />
        <Line dataKey="traditionalStressIndex" name="Traditional" stroke="#66768A" strokeWidth={2} dot={false} />
        <Line dataKey="careflowStressIndex" name="CareFlow" stroke="#16C7B7" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
