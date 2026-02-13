'use client'

import { motion } from 'framer-motion'
import { Card } from '../ui/card'

const bulletPoints = [
  'Passgenau: exakt nach deinen Abläufen.',
  'Skalierbar: wächst mit deinem Business.',
  'Sauber integriert: Buchung, Bestellung, Tools – alles an einem Ort.'
]

export function WhySection() {
  return (
    <motion.section
      id="ablauf"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-[1200px] px-6 py-20"
    >
      <Card className="border border-card-border bg-[#f8f9fb]">
        <h2 className="text-3xl font-semibold text-[#0f172a]">Individuell statt Baukasten.</h2>
        <div className="mt-6 space-y-3 text-lg text-slate-600">
          {bulletPoints.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#0f172a]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.section>
  )
}
