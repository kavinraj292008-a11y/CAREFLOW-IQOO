export function MetricStat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="panel p-4">
      <p className="text-[12px] text-text-secondary">{label}</p>
      <p className="text-[28px] font-semibold text-text-primary mt-1 tabular-nums">{value}</p>
      {hint && <p className="text-[12px] text-text-muted mt-1">{hint}</p>}
    </div>
  )
}
