import { NextRequest, NextResponse } from 'next/server'
import { projectRequestSchema } from '@/lib/validators/projectRequest'
import { supabaseServer } from '@/lib/supabase/server'

const RATE_LIMIT_WINDOW = 1000 * 60
const RATE_LIMIT_MAX = 5
const rateLimit = new Map<string, { count: number; start: number }>()

function getClientIp(req: NextRequest) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  )
}

function isRateLimited(key: string) {
  const entry = rateLimit.get(key)
  const now = Date.now()

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimit.set(key, { count: 1, start: now })
    return false
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true
  }

  entry.count += 1
  return false
}

async function triggerNotification(data: Record<string, unknown>) {
  const edgeUrl = process.env.SUPABASE_EMBEDDED_FUNCTION_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!edgeUrl || !serviceKey) {
    console.warn('Supabase Edge function not configured, skipping notification')
    return
  }

  const res = await fetch(edgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    const body = await res.text()
    console.warn('Edge notification failed', res.status, body)
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (isRateLimited(ip)) {
      return NextResponse.json({ message: 'Zu viele Anfragen. Versuche es gleich noch einmal.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = projectRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: 'Ungültige Daten', issues: parsed.error.format() }, { status: 400 })
    }

    const data = parsed.data

    if (data.website?.trim()) {
      return NextResponse.json({ message: 'Bot erkannt.' }, { status: 400 })
    }

    const { error } = await supabaseServer.from('project_requests').insert({
      project_type: data.projectType,
      industry: data.industry,
      has_existing_website: data.hasExistingWebsite === 'yes',
      existing_website_url: data.existingWebsiteUrl ?? null,
      primary_goal: data.primaryGoal,
      target_audience: data.targetAudience,
      features: data.features,
      description: data.description ?? '',
      budget_range: data.budget,
      timeline: data.timeline,
      contact_name: data.contactName,
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone ?? null,
      preferred_contact: data.preferredContact,
      consent: data.consent
    })

    if (error) {
      console.error('Supabase insert failed', error)
      return NextResponse.json({ message: 'Fehler beim Speichern.' }, { status: 500 })
    }

    await triggerNotification({
      projectType: data.projectType,
      industry: data.industry,
      budget: data.budget,
      timeline: data.timeline,
      features: data.features,
      description: data.description,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      preferredContact: data.preferredContact
    })

    return NextResponse.json({ message: 'Erfolg' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Unbekannter Fehler. Versuche es später erneut.' }, { status: 500 })
  }
}
