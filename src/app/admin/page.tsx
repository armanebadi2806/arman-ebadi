import { supabaseServer } from '@/lib/supabase/server'

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: { token?: string }
}) {
  const adminToken = process.env.ADMIN_DASHBOARD_TOKEN

  if (!adminToken) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-20">
        <h1 className="text-3xl font-semibold">Admin nicht konfiguriert</h1>
        <p className="mt-4 text-slate-600">Setze `ADMIN_DASHBOARD_TOKEN` in deiner `.env.local`.</p>
      </div>
    )
  }

  if (searchParams.token !== adminToken) {
    return (
      <div className="mx-auto max-w-[900px] px-6 py-20">
        <h1 className="text-3xl font-semibold">Nicht autorisiert</h1>
        <p className="mt-4 text-slate-600">Oeffne die Seite mit `?token=DEIN_TOKEN`.</p>
      </div>
    )
  }

  const { data, error } = await supabaseServer
    .from('project_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1 className="text-3xl font-semibold">Anfragen (Admin)</h1>
      <p className="mt-2 text-sm text-slate-500">Neueste 100 Eintraege aus `project_requests`.</p>

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Fehler beim Laden: {error.message}
        </div>
      )}

      {!error && (!data || data.length === 0) && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Noch keine Anfragen vorhanden.
        </div>
      )}

      <div className="mt-6 space-y-4">
        {data?.map((row) => (
          <article key={row.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{row.contact_name || 'Ohne Namen'}</h2>
              <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              <p><strong>Projekt:</strong> {row.project_type || '-'}</p>
              <p><strong>Ziel:</strong> {row.primary_goal || '-'}</p>
              <p><strong>Budget:</strong> {row.budget_range || '-'}</p>
              <p><strong>Timeline:</strong> {row.timeline || '-'}</p>
              <p><strong>E-Mail:</strong> {row.contact_email || '-'}</p>
              <p><strong>Telefon:</strong> {row.contact_phone || '-'}</p>
              <p><strong>Kontaktweg:</strong> {row.preferred_contact || '-'}</p>
            </div>

            <p className="mt-3 text-sm text-slate-600"><strong>Features:</strong> {Array.isArray(row.features) && row.features.length ? row.features.join(', ') : '-'}</p>
            <p className="mt-2 text-sm text-slate-600"><strong>Notiz:</strong> {row.description || '-'}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
