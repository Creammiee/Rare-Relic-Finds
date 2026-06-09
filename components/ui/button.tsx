import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black-900 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-gold-600 to-gold-400 text-black-950 hover:from-gold-500 hover:to-gold-300 shadow-lg hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] focus-visible:ring-gold-400',
        outline:
          'border border-gold-400/50 text-gold-400 hover:bg-gold-400/10 hover:border-gold-400 focus-visible:ring-gold-400',
        ghost:
          'text-silver-400 hover:text-silver-200 hover:bg-white/5 focus-visible:ring-silver-400',
        destructive:
          'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 focus-visible:ring-red-400',
        secondary:
          'bg-white/5 border border-white/10 text-silver-300 hover:bg-white/10 hover:text-silver-100 focus-visible:ring-silver-400',
        link: 'text-gold-400 underline-offset-4 hover:underline focus-visible:ring-gold-400',
        silver:
          'bg-gradient-to-r from-silver-600 to-silver-400 text-black-950 hover:from-silver-500 hover:to-silver-300 shadow-lg focus-visible:ring-silver-400',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
