import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const styles: Record<ButtonVariant, string> = {
  primary: 'bg-[#0f172a] text-white border border-transparent hover:bg-black',
  secondary: 'bg-white border border-[#0f172a] text-[#0f172a] hover:bg-[#f4f4f4]',
  ghost: 'bg-transparent border border-transparent text-[#0f172a]'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn('inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition', styles[variant], className)}
      {...props}
    />
  )
})

Button.displayName = 'Button'
