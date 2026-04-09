import * as React from 'react'

import { cn } from '@/lib/utils.ts'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variantClasses = {
      default:
        'bg-[linear-gradient(135deg,rgba(202,158,230,1),rgba(186,187,241,0.96))] text-ctp-crust shadow-[0_12px_30px_rgba(202,158,230,0.22)] hover:brightness-110',
      destructive:
        'bg-[linear-gradient(135deg,rgba(231,130,132,1),rgba(239,159,118,0.94))] text-ctp-crust shadow-[0_12px_30px_rgba(231,130,132,0.18)] hover:brightness-105',
      outline:
        'border border-white/10 bg-[rgba(81,87,109,0.42)] text-ctp-text hover:bg-[rgba(98,104,128,0.5)]',
      secondary:
        'border border-white/10 bg-[rgba(166,209,137,0.14)] text-ctp-green hover:bg-[rgba(166,209,137,0.22)]',
      ghost: 'text-ctp-text hover:bg-[rgba(255,255,255,0.06)]',
      link: 'text-ctp-blue underline-offset-4 hover:underline',
    }

    const sizeClasses = {
      default: 'h-11 px-5 py-2',
      sm: 'h-9 px-3.5 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-11 w-11',
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-2xl text-sm font-medium ring-offset-ctp-base transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-mauve focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
