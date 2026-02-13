'use client'

import { motion } from 'framer-motion'

interface StepIndicatorProps {
  current: number
  steps: string[]
}

export function StepIndicator({ current, steps }: StepIndicatorProps) {
  return (
    <div aria-label="Fortschritt" className="space-y-2">
      <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{current + 1}/{steps.length}</p>
      <div className="h-2 rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-[#0f172a]"
          initial={{ width: 0 }}
          animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  )
}
