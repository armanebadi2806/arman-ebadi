'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function FinalCtaSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="mx-auto max-w-[1200px] px-6 py-20"
    >
      <div className="rounded-[2rem] border border-card-border bg-gradient-to-br from-white via-white to-[#f4f6fb] p-10 text-center shadow-soft">
        <p className="text-sm uppercase tracking-[0.6em] text-slate-500">Ready?</p>
        <h2 className="mt-4 text-4xl font-semibold text-[#0f172a] md:text-5xl">Bereit für eine Seite, die verkauft?</h2>
        <p className="mt-4 text-lg text-slate-600">Kurz ein paar Fragen beantworten – ich melde mich innerhalb von 24 Stunden.</p>
        <Link
          href="/anfrage"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-[#0f172a] px-8 py-3 text-sm font-semibold transition hover:bg-[#0f172a] hover:text-white"
        >
          Projekt anfragen
        </Link>
      </div>
    </motion.section>
  )
}
