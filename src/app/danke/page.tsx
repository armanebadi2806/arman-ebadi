import Link from 'next/link'

export default function DankePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9fb] px-6 py-20 text-center">
      <div className="max-w-[800px] space-y-6 rounded-[2rem] border border-card-border bg-white/90 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.5em] text-slate-500">Danke</p>
        <h1 className="text-4xl font-semibold text-[#0f172a] md:text-5xl">Danke! Ich melde mich innerhalb von 24 Stunden.</h1>
        <p className="text-lg text-slate-600">
          Deine Anfrage ist eingegangen. Ich schaue mir alle Details an und antworte zeitnah mit einem Vorschlag.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-[#0f172a] px-6 py-3 text-sm font-semibold transition hover:bg-[#0f172a] hover:text-white"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}
