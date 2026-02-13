'use client'

import { motion } from 'framer-motion'

const badges = ['UX', 'Conversion', 'Automatisierung', 'Individuelle Systeme']

export function AboutSection() {
  return (
    <motion.section
      id="ueber-mich"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mx-auto max-w-[900px] px-6 py-20"
    >
      <div className="rounded-3xl border border-card-border bg-white/80 p-8 shadow-soft">
        <h2 className="text-3xl font-semibold text-[#0f172a]">Arman Ebadi (M.Sc. Psychologie)</h2>
        <p className="mt-4 text-lg text-slate-600">
          Ich kombiniere Webentwicklung mit Werbe- und Wirtschaftspsychologie, um Seiten zu bauen, die Nutzer intuitiv
          führen und Anfragen steigern.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {badges.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-[#cbd5f5] px-4 py-1 text-sm font-semibold text-[#1b4f72]"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
