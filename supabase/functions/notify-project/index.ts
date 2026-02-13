import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'
import { z } from 'https://esm.sh/zod@3.23.1'

const requestSchema = z.object({
  projectType: z.string(),
  industry: z.string(),
  budget: z.string(),
  timeline: z.string(),
  features: z.array(z.string()),
  description: z.string().optional(),
  contactName: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  preferredContact: z.string()
})

const sendEmail = async (params: { subject: string; html: string; to: string; from: string }) => {
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) throw new Error('RESEND_API_KEY fehlt')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html
    })
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend fehlgeschlagen: ${body}`)
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Methode nicht erlaubt', { status: 405 })
  }

  try {
    const parsed = requestSchema.parse(await req.json())

    const notifyTo = Deno.env.get('NOTIFY_EMAIL_TO')
    const notifyFrom = Deno.env.get('NOTIFY_EMAIL_FROM')

    if (!notifyTo || !notifyFrom) {
      return new Response(JSON.stringify({ message: 'Notifikation nicht konfiguriert' }), { status: 500 })
    }

    const featureList = parsed.features.length ? parsed.features.join(', ') : 'Keine besonderen Features'

    const summary = `
      <p>Neue Projekt-Anfrage:</p>
      <ul>
        <li><strong>Projektart:</strong> ${parsed.projectType}</li>
        <li><strong>Branche:</strong> ${parsed.industry}</li>
        <li><strong>Budget:</strong> ${parsed.budget}</li>
        <li><strong>Timeline:</strong> ${parsed.timeline}</li>
        <li><strong>Features:</strong> ${featureList}</li>
      </ul>
      <p><strong>Kontakt:</strong> ${parsed.contactName} / ${parsed.contactEmail} / ${parsed.contactPhone ?? '—'} (bevorzugt ${parsed.preferredContact})</p>
      <p>Beschreibung: ${parsed.description ?? '—'}</p>
    `

    await sendEmail({
      from: notifyFrom,
      to: notifyTo,
      subject: `Neue Projektanfrage von ${parsed.contactName}`,
      html: summary
    })

    await sendEmail({
      from: notifyFrom,
      to: parsed.contactEmail,
      subject: 'Danke für deine Projektanfrage',
      html: `<p>Danke, ${parsed.contactName}! Ich melde mich innerhalb von 24 Stunden.</p>`
    })

    return new Response(JSON.stringify({ message: 'Notification sent' }), { status: 200 })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ message: 'Fehler im Notification Service' }), { status: 500 })
  }
})
