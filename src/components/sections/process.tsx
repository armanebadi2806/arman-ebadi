'use client'

import { motion } from 'framer-motion'
import { Card } from '../ui/card'

const steps = [
  'Projekt-Check (2–3 Minuten)',
  'Rückmeldung binnen 24h',
  'Konzept → Umsetzung → Launch'
]

export function ProcessSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mx-auto max-w-[900px] px-6 py-20"
    >
      <h2 className="text-3xl font-semibold text-[#0f172a]">Ablauf</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step} className="border border-card-border bg-white/80">
            <p className="text-sm text-slate-500">Schritt {index + 1}</p>
            <h3 className="mt-2 text-lg font-semibold text-[#0f172a]">{step}</h3>
          </Card>
        ))}
      </div>
    </motion.section>
  )
}
