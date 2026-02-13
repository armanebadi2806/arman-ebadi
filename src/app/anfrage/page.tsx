import Link from 'next/link'
import { MultiStepForm } from '@/components/wizard/multi-step-form'

export default function AnfragePage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb] py-20">
      <div className="mx-auto max-w-[1000px] space-y-10 px-6">
        <div className="space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Projekt-Anfrage</p>
          <h1 className="text-4xl font-semibold text-[#0f172a] md:text-5xl">Projekt anfragen</h1>
          <p className="text-lg text-slate-600">
            Kurz ein paar Fragen beantworten – ich melde mich innerhalb von 24 Stunden. Kein Showroom, keine Boilerplate.
          </p>
          <p className="text-sm text-slate-500">Stufenloser Fortschritt, Speicherung im Browser, sichere Supabase-Anbindung.</p>
        </div>
        <MultiStepForm />
        <div className="rounded-3xl border border-card-border bg-white/80 p-6 text-sm text-slate-500">
          <p>Hast du noch keine klare Vorstellung?</p>
          <p>
            Kein Problem. Schreibe deine aktuellen Abläufe in die Freitexte oder benutze das Feld "Zielgruppe", damit ich
            direkt verstehe, wer deine Nutzer sind.
          </p>
          <Link href="/" className="mt-3 inline-flex text-[#0f172a] underline">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  )
}
