import { cn } from '@/utils/cn'

export function Card({
  children,
  className,
  elevated = false,
}: {
  children: React.ReactNode
  className?: string
  elevated?: boolean
}) {
  return (
    <div className={cn(elevated ? 'panel-elevated' : 'panel', 'p-5', className)}>{children}</div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="text-[15px] font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-[13px] text-text-secondary mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
