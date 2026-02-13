import { cn } from '@/lib/utils'
import { FC, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean
}

export const Card: FC<CardProps> = ({ className, accent = false, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-3xl border border-card-border bg-white/80 p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl',
        accent && 'border-transparent bg-white shadow-xl',
        className
      )}
      {...props}
    />
  )
}
