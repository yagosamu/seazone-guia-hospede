import { z } from 'zod'
import { ItineraryRequestSchema, ItinerarySchema, LocaleSchema } from './schema'
export const RefinementTurnSchema = z.object({ role: z.enum(['user', 'assistant']), content: z.string() })
export const RefineRequestSchema = z.object({ code: z.string().min(1), currentItinerary: ItinerarySchema, originalRequest: ItineraryRequestSchema.omit({ code: true, locale: true }), refinementMessage: z.string().min(1).max(500), history: z.array(RefinementTurnSchema).max(10).optional().default([]), locale: LocaleSchema.optional().default('pt') })
export type RefinementTurn = z.infer<typeof RefinementTurnSchema>
