import type { ExperiencesGuide } from '@/db/schemas/experiences'
import type { Itinerary } from './types'
import { ItineraryError } from './errors'

export function validateItineraryCoherence(itinerary: Itinerary, requestedDays: number, guide: ExperiencesGuide | null): void {
  if (itinerary.days.length !== requestedDays || itinerary.days.some((day, index) => day.day_number !== index + 1)) {
    throw new ItineraryError('Dias do roteiro devem ser sequenciais e corresponder ao pedido', 502)
  }
  const guidePlaces = new Set(guide ? [...guide.restaurants, ...guide.attractions, ...guide.essentials].map((item) => item.name) : [])
  for (const activity of itinerary.days.flatMap((day) => day.activities)) {
    if (activity.from_guide && (!activity.place || !guidePlaces.has(activity.place))) {
      throw new ItineraryError('Atividade marcada como guia deve referenciar um lugar do guide', 502)
    }
  }
}
