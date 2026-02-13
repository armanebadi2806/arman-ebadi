'use client'

import { motion } from 'framer-motion'
import { Card } from '../ui/card'

const services = [
  {
    title: 'Websites',
    description: 'Schnell, klar, conversion-optimiert. Für Unternehmen, die professionell auftreten wollen.'
  },
  {
    title: 'Interne Tools',
    description: 'Kundenportale, Admin-Bereiche, Prozesse – exakt passend zu deinem Workflow.'
  },
  {
    title: 'Automatisierung',
    description: 'Terminbuchung, Bestellungen, E-Mails, CRM-Anbindung, KI-gestützte Abläufe.'
  }
]

export function ServicesSection() {
  return (
    <motion.section
      id="leistungen"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="mx-auto max-w-[1200px] px-6 py-20"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service) => (
          <Card key={service.title} className="border border-card-border bg-white/70">
            <h3 className="text-2xl font-semibold text-[#0f172a]">{service.title}</h3>
            <p className="mt-3 text-sm text-slate-600">{service.description}</p>
          </Card>
        ))}
      </div>
    </motion.section>
  )
}
