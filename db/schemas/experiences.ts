import { z } from 'zod'

export const RestaurantSchema = z.object({
  name: z.string(),
  distance: z.string(),
  description: z.string(),
})

export const AttractionSchema = z.object({
  name: z.string(),
  distance: z.string(),
  description: z.string(),
})

export const EssentialTypeSchema = z.enum([
  'pharmacy',
  'market',
  'hospital',
  'gas_station',
  'bank',
  'other',
])

export const EssentialSchema = z.object({
  name: z.string(),
  type: EssentialTypeSchema,
  distance: z.string(),
  description: z.string(),
})

export const ExperiencesGuideSchema = z.object({
  restaurants: z.array(RestaurantSchema).min(4).max(5),
  attractions: z.array(AttractionSchema).min(3).max(4),
  essentials: z.array(EssentialSchema).min(3),
  seasonal_tips: z.string(),
})

export type Restaurant = z.infer<typeof RestaurantSchema>
export type Attraction = z.infer<typeof AttractionSchema>
export type Essential = z.infer<typeof EssentialSchema>
export type ExperiencesGuide = z.infer<typeof ExperiencesGuideSchema>
