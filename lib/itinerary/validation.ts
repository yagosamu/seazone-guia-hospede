import type { ExperiencesGuide } from '@/db/schemas/experiences'
import type { Itinerary, Transport } from './types'

export type ValidationResult = { kind: 'ok'; itinerary: Itinerary } | { kind: 'hard_fail'; reason: 'radius_violation' | 'profile_violation' | 'general' }

export function validateAndAutoCorrect(itinerary: Itinerary, requestedDays: number, guide: ExperiencesGuide | null, transport: Transport = 'mixed', profiles: string[] = []): ValidationResult {
  if (!itinerary.days.length || itinerary.days.some(day => !day.activities.length)) return { kind: 'hard_fail', reason: 'general' }
  if (itinerary.days.length !== requestedDays) return { kind: 'hard_fail', reason: 'general' }
  const guideNames = guide ? [...guide.restaurants, ...guide.attractions, ...guide.essentials].map(item => item.name) : []
  const corrected: Itinerary = { ...itinerary, days: itinerary.days.map((day, index) => ({ ...day, day_number: index + 1, activities: day.activities.slice(0, 4).map(activity => {
    const matching = activity.place && guideNames.find(name => name.toLowerCase() === activity.place!.toLowerCase() || name.toLowerCase().includes(activity.place!.toLowerCase()) || activity.place!.toLowerCase().includes(name.toLowerCase()))
    return { ...activity, from_guide: activity.from_guide && matching ? true : activity.from_guide ? false : activity.from_guide }
  }) })) }
  for (const activity of corrected.days.flatMap(day => day.activities)) {
    const text = `${activity.title} ${activity.place ?? ''}`.toLowerCase()
    if (profiles.includes('mountain') && /praia|beach/.test(text)) return { kind: 'hard_fail', reason: 'profile_violation' }
    if (profiles.includes('coastal') && /montanha|mountain/.test(text)) return { kind: 'hard_fail', reason: 'profile_violation' }
    if (activity.distance_from_property && outsideRadius(activity.distance_from_property, transport)) return { kind: 'hard_fail', reason: 'radius_violation' }
  }
  return { kind: 'ok', itinerary: corrected }
}

function outsideRadius(value: string, transport: Transport): boolean { if (transport === 'mixed') return false; const v=value.toLowerCase().replace(',', '.'); const km=Number(v.match(/(\d+(?:\.\d+)?)\s*km/)?.[1] ?? 0); const min=Number(v.match(/(\d+)\s*min/)?.[1] ?? 0); return transport === 'walk' ? km > 2.5 || (/a pé|bicicleta/.test(v) && min > 30) : km > 20 || (/(carro|uber)/.test(v) && min > 30) }

export function validateItineraryCoherence(itinerary: Itinerary, requestedDays: number, guide: ExperiencesGuide | null, transport: Transport = 'mixed'): void { const result=validateAndAutoCorrect(itinerary,requestedDays,guide,transport); if(result.kind==='hard_fail') throw new Error(result.reason) }
