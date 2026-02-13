import { z } from 'zod'

export const projectRequestSchema = z.object({
  projectType: z.enum(['Website', 'Website + internes System', 'nur internes System']),
  industry: z.string().min(2).max(120),
  hasExistingWebsite: z.enum(['yes', 'no']),
  existingWebsiteUrl: z
    .string()
    .url()
    .or(z.literal(''))
    .optional(),
  primaryGoal: z.enum(['Mehr Anfragen', 'Termine', 'Bestellungen', 'Information/Brand']),
  targetAudience: z.string().min(3).max(200),
  features: z.array(
    z.enum([
      'Terminbuchung',
      'Bestellfunktion',
      'Kundenkonto/Portal',
      'Admin-Dashboard',
      'Automationen',
      'KI-Funktion'
    ])
  ),
  description: z.string().max(1000).optional(),
  budget: z.enum(['< 1.000 €', '1.000–3.000 €', '3.000–7.000 €', '7.000 €+']),
  timeline: z.enum(['ASAP', '2–4 Wochen', '1–2 Monate', 'flexibel']),
  contactName: z.string().min(2).max(80),
  contactEmail: z.string().email(),
  contactPhone: z.string().max(40).optional(),
  preferredContact: z.enum(['E-Mail', 'Telefon', 'WhatsApp']),
  consent: z.literal(true),
  website: z.string().max(2).optional()
}).superRefine((value, ctx) => {
  if (value.hasExistingWebsite === 'yes' && !value.existingWebsiteUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Bitte gib die URL deiner bestehenden Seite an.',
      path: ['existingWebsiteUrl']
    })
  }
})

export type ProjectRequestForm = z.infer<typeof projectRequestSchema>
