import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCompactINR } from '@/utils/format'

export interface ComparisonChartPoint {
  label: string
  treatment: number
  traditional: number
  careflow: number
}

export function RepaymentComparisonChart({ data, height = 320 }: { data: ComparisonChartPoint[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#66768A', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.08)' }} tickLine={false} />
        <YAxis
          tickFormatter={(v) => formatCompactINR(v)}
          tick={{ fill: '#66768A', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          contentStyle={{ background: '#162437', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#F5F7FA' }}
          formatter={(value: number) => formatCompactINR(value)}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9AA8B8' }} />
        <Bar dataKey="treatment" name="Treatment expense" fill="#F06C6C" fillOpacity={0.55} radius={[3, 3, 0, 0]} />
        <Line dataKey="traditional" name="Traditional EMI" stroke="#66768A" strokeWidth={2} dot={false} />
        <Line dataKey="careflow" name="CareFlow" stroke="#16C7B7" strokeWidth={2.5} dot={{ r: 3, fill: '#16C7B7' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
