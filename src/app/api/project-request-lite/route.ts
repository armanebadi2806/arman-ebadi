import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseServer } from '@/lib/supabase/server'

const RATE_LIMIT_WINDOW = 1000 * 60
const RATE_LIMIT_MAX = 5
const rateLimit = new Map<string, { count: number; start: number }>()

const liteSchema = z.object({
  projectType: z.string().max(80).optional().default(''),
  primaryGoal: z.string().max(80).optional().default(''),
  budgetRange: z.string().max(80).optional().default(''),
  timeline: z.string().max(80).optional().default(''),
  preferredContact: z.string().max(80).optional().default(''),
  features: z.array(z.string().max(80)).optional().default([]),
  featureNotes: z.string().max(1000).optional().default(''),
  contactName: z.string().max(100).optional().default(''),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(6).max(40),
  website: z.string().max(80).optional().default('')
})

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

  if (!edgeUrl || !serviceKey) return

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
      return NextResponse.json({ message: 'Zu viele Anfragen. Bitte in einer Minute erneut versuchen.' }, { status: 429 })
    }

    const body = await req.json()
    const parsed = liteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ message: 'Ungueltige Eingaben.', issues: parsed.error.format() }, { status: 400 })
    }

    const data = parsed.data

    if (data.website.trim().length > 0) {
      return NextResponse.json({ message: 'Anfrage konnte nicht verarbeitet werden.' }, { status: 400 })
    }

    const cleanedFeatures = data.features
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 20)

    const { error } = await supabaseServer.from('project_requests').insert({
      project_type: data.projectType || 'Nicht angegeben',
      industry: 'Nicht angegeben',
      has_existing_website: false,
      existing_website_url: null,
      primary_goal: data.primaryGoal || 'Nicht angegeben',
      target_audience: 'Nicht angegeben',
      features: cleanedFeatures,
      description: data.featureNotes || '',
      budget_range: data.budgetRange || 'Nicht angegeben',
      timeline: data.timeline || 'Nicht angegeben',
      contact_name: data.contactName || 'Nicht angegeben',
      contact_email: data.contactEmail,
      contact_phone: data.contactPhone,
      preferred_contact: data.preferredContact || 'Nicht angegeben',
      consent: true
    })

    if (error) {
      console.error('Supabase insert failed', error)
      return NextResponse.json({ message: 'Fehler beim Speichern der Anfrage.' }, { status: 500 })
    }

    await triggerNotification({
      projectType: data.projectType || 'Nicht angegeben',
      industry: 'Nicht angegeben',
      budget: data.budgetRange || 'Nicht angegeben',
      timeline: data.timeline || 'Nicht angegeben',
      features: cleanedFeatures,
      description: data.featureNotes,
      contactName: data.contactName || 'Nicht angegeben',
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      preferredContact: data.preferredContact || 'Nicht angegeben'
    })

    return NextResponse.json({ message: 'Erfolg' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Unbekannter Fehler. Bitte spaeter erneut versuchen.' }, { status: 500 })
  }
}
