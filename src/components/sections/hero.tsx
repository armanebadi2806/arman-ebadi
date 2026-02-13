'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-20"
    >
      <div className="space-y-5">
        <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Webdesign & Systeme</p>
        <h1 className="text-5xl font-semibold leading-tight text-[#0f172a] md:text-6xl">
          Websites, die wirken. Systeme, die Zeit sparen.
        </h1>
        <p className="text-lg text-slate-600">
          Individuelles Webdesign + interne Tools (Termin, Bestellung, Automatisierung) – ohne Baukasten. Antwort
          in 24h.
        </p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href="/anfrage"
          className="rounded-full bg-[#0f172a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          Projekt anfragen
        </Link>
        <span className="text-sm text-slate-500">Antwort innerhalb von 24 Stunden.</span>
      </div>
    </motion.section>
  )
}
