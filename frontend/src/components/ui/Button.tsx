import { cn } from '@/utils/cn'
import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent-teal text-bg-primary hover:bg-accent-tealLight font-semibold',
  secondary: 'bg-surface-elevated text-text-primary border border-border hover:border-white/20',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'text-[13px] px-3 py-1.5',
  md: 'text-[14px] px-4 py-2',
}

export function Button({ variant = 'secondary', size = 'md', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}
