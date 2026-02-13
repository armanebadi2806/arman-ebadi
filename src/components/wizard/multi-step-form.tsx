'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { projectRequestSchema, type ProjectRequestForm } from '@/lib/validators/projectRequest'
import { Button } from '../ui/button'
import { StepIndicator } from '@/components/sections/wizard/step-indicator'

const STEPS = ['Basics', 'Ziele & Features', 'Rahmen', 'Kontakt'] as const

const STORAGE_KEY = 'project-request-form'

export function MultiStepForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ProjectRequestForm>({
    mode: 'all',
    resolver: zodResolver(projectRequestSchema),
    defaultValues: {
      projectType: 'Website',
      industry: '',
      hasExistingWebsite: 'no',
      existingWebsiteUrl: '',
      primaryGoal: 'Mehr Anfragen',
      targetAudience: '',
      features: [],
      description: '',
      budget: '< 1.000 €',
      timeline: 'ASAP',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      preferredContact: 'E-Mail',
      consent: false,
      website: ''
    }
  })

  const [step, setStep] = useState(0)
  const hasExistingWebsite = watch('hasExistingWebsite')
  const existingWebsiteUrl = watch('existingWebsiteUrl')
  const watchedValues = watch()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.entries(parsed).forEach(([key, value]) => {
        control?.setValue(key as keyof ProjectRequestForm, value)
      })
    }
  }, [control])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedValues))
  }, [watchedValues])

  const canProceed = useMemo(() => {
    if (step === 0) {
      const websiteProvided = hasExistingWebsite === 'yes' ? Boolean(existingWebsiteUrl) : true
      return Boolean(watchedValues.industry && watchedValues.projectType && websiteProvided)
    }
    if (step === 1) {
      return Boolean(watchedValues.targetAudience && watchedValues.primaryGoal)
    }
    if (step === 2) {
      return Boolean(watchedValues.budget && watchedValues.timeline)
    }
    if (step === 3) {
      return Boolean(watchedValues.contactName && watchedValues.contactEmail && watchedValues.consent)
    }
    return false
  }, [step, watchedValues, hasExistingWebsite, existingWebsiteUrl])

  const onSubmit = async (data: ProjectRequestForm) => {
    setIsSubmitting(true)
    setApiError('')

    try {
      const response = await fetch('/api/project-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.message ?? 'Fehler beim Absenden der Anfrage.')
      }

      localStorage.removeItem(STORAGE_KEY)
      router.push('/danke')
    } catch (error) {
      setApiError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] rounded-[2rem] border border-card-border bg-white/90 p-8 shadow-soft">
      <StepIndicator current={step} steps={Array.from(STEPS)} />
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {step === 0 && (
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Projektart</label>
              <select
                {...register('projectType')}
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              >
                <option>Website</option>
                <option>Website + internes System</option>
                <option>nur internes System</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Branche</label>
              <input
                {...register('industry')}
                placeholder="z. B. Coaching, Agency, Software"
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              />
              {errors.industry && <p className="text-xs text-red-500">{errors.industry.message}</p>}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Bestehende Website?</p>
              <div className="flex gap-6 text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="yes" {...register('hasExistingWebsite')} className="h-4 w-4" />
                  Ja
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" value="no" {...register('hasExistingWebsite')} defaultChecked className="h-4 w-4" />
                  Nein
                </label>
              </div>
            </div>
            {hasExistingWebsite === 'yes' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Website URL</label>
                <input
                  {...register('existingWebsiteUrl')}
                  placeholder="https://"
                  className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
                />
                {errors.existingWebsiteUrl && <p className="text-xs text-red-500">{errors.existingWebsiteUrl.message}</p>}
              </div>
            )}
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Hauptziel</label>
              <select
                {...register('primaryGoal')}
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              >
                <option>Mehr Anfragen</option>
                <option>Termine</option>
                <option>Bestellungen</option>
                <option>Information/Brand</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Zielgruppe</label>
              <input
                {...register('targetAudience')}
                placeholder="Wen willst du erreichen?"
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              />
              {errors.targetAudience && <p className="text-xs text-red-500">{errors.targetAudience.message}</p>}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Features</p>
              <div className="grid gap-3 text-sm text-[#0f172a] md:grid-cols-2">
                {[
                  'Terminbuchung',
                  'Bestellfunktion',
                  'Kundenkonto/Portal',
                  'Admin-Dashboard',
                  'Automationen',
                  'KI-Funktion'
                ].map((feature) => (
                  <label
                    key={feature}
                    className="rounded-2xl border border-card-border px-4 py-3 hover:border-black"
                  >
                    <input type="checkbox" value={feature} {...register('features')} className="mr-3 h-4 w-4" />
                    {feature}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Kurz beschrieben</label>
              <textarea
                {...register('description')}
                placeholder="Was soll am Ende funktionieren?"
                rows={4}
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Budget</label>
              <select
                {...register('budget')}
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              >
                <option>&lt; 1.000 €</option>
                <option>1.000–3.000 €</option>
                <option>3.000–7.000 €</option>
                <option>7.000 €+</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Zeitrahmen</label>
              <select
                {...register('timeline')}
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              >
                <option>ASAP</option>
                <option>2–4 Wochen</option>
                <option>1–2 Monate</option>
                <option>flexibel</option>
              </select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Name</label>
              <input
                {...register('contactName')}
                placeholder="Dein Name"
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              />
              {errors.contactName && <p className="text-xs text-red-500">{errors.contactName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">E-Mail</label>
              <input
                {...register('contactEmail')}
                type="email"
                placeholder="dein@kontakt.de"
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              />
              {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Telefon</label>
              <input
                {...register('contactPhone')}
                placeholder="optional"
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Bevorzugter Kontakt</label>
              <select
                {...register('preferredContact')}
                className="w-full rounded-2xl border border-card-border bg-white px-4 py-3 text-sm text-[#0f172a] focus:border-[#0f172a]"
              >
                <option>E-Mail</option>
                <option>Telefon</option>
                <option>WhatsApp</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-3">
              <input type="checkbox" {...register('consent')} className="h-4 w-4" />
              <span className="text-sm text-slate-600">Ich bin einverstanden, dass du mich kontaktierst.</span>
            </label>
            <input type="text" className="hidden" {...register('website')} autoComplete="off" />
          </div>
        )}

        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
        <div className="flex flex-wrap gap-3">
          {step > 0 && (
            <Button variant="ghost" type="button" onClick={handleBack}>
              Zurück
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext} disabled={!canProceed}>
              Weiter
            </Button>
          ) : (
            <Button type="submit" disabled={!canProceed || isSubmitting}>
              {isSubmitting ? 'Sende...' : 'Absenden'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
