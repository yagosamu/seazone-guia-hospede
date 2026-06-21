import type { ExperiencesGuide } from '@/db/schemas/experiences'
import type { Itinerary, Transport } from './types'
import { ItineraryError } from './errors'

export function validateItineraryCoherence(itinerary: Itinerary, requestedDays: number, guide: ExperiencesGuide | null, transport: Transport = 'mixed'): void {
  if (itinerary.days.length !== requestedDays || itinerary.days.some((day, index) => day.day_number !== index + 1)) {
    throw new ItineraryError('Dias do roteiro devem ser sequenciais e corresponder ao pedido', 502)
  }
  const guidePlaces = new Set(guide ? [...guide.restaurants, ...guide.attractions, ...guide.essentials].map((item) => item.name) : [])
  for (const activity of itinerary.days.flatMap((day) => day.activities)) {
    if (activity.from_guide && (!activity.place || !guidePlaces.has(activity.place))) {
      throw new ItineraryError('Atividade marcada como guia deve referenciar um lugar do guide', 502)
    }
    if (activity.distance_from_property && isOutsideTransportRadius(activity.distance_from_property, transport)) throw new ItineraryError('Roteiro fora do raio de locomoção escolhido — tente regenerar', 502)
  }
}

function isOutsideTransportRadius(value: string, transport: Transport): boolean {
  if (transport === 'mixed') return false
  const normalized = value.toLowerCase().replace(',', '.')
  const km = normalized.match(/(\d+(?:\.\d+)?)\s*km/)?.[1]
  const minutes = normalized.match(/(\d+)\s*min/)?.[1]
  if (transport === 'walk') return (km ? Number(km) > 1.5 : false) || (/a pé|bicicleta/.test(normalized) && minutes ? Number(minutes) > 20 : false)
  return (km ? Number(km) > 20 : false) || (/(carro|uber)/.test(normalized) && minutes ? Number(minutes) > 30 : false)
}
