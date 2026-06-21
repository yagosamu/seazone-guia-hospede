import { z } from 'zod'

export const PeriodSchema = z.enum(['morning', 'afternoon', 'evening'])
export const ActivitySchema = z.object({ period: PeriodSchema, title: z.string().min(1).max(80), description: z.string().min(1).max(300), place: z.string().optional(), from_guide: z.boolean().optional() })
export const DaySchema = z.object({ day_number: z.number().int().min(1).max(7), title: z.string().min(1).max(80), activities: z.array(ActivitySchema).min(1).max(5) })
export const ItinerarySchema = z.object({ intro: z.string().min(1).max(400), days: z.array(DaySchema).min(1).max(7), closing_tip: z.string().max(300).optional() })
export const WhoSchema = z.enum(['couple', 'family_with_kids', 'solo', 'friends'])
export const VibeSchema = z.enum(['relax', 'adventure', 'gastronomy', 'culture', 'nightlife'])
export const LocaleSchema = z.enum(['pt', 'en', 'es'])
export const ItineraryRequestSchema = z.object({ code: z.string().min(1), days: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), who: WhoSchema, vibe: VibeSchema, restrictions: z.string().max(500).optional(), locale: LocaleSchema.optional().default('pt') })
