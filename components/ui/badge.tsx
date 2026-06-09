import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-gold-400/40 bg-gold-400/10 text-gold-400',
        secondary: 'border-white/10 bg-white/5 text-silver-400',
        success: 'border-green-400/40 bg-green-400/10 text-green-400',
        warning: 'border-yellow-400/40 bg-yellow-400/10 text-yellow-400',
        destructive: 'border-red-400/40 bg-red-400/10 text-red-400',
        info: 'border-blue-400/40 bg-blue-400/10 text-blue-400',
        purple: 'border-purple-400/40 bg-purple-400/10 text-purple-400',
        outline: 'border-white/20 text-silver-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
