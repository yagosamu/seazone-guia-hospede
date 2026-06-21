import { describe, expect, it } from 'vitest'
import { FLN001 } from '@/db/fixtures/fln001'
import { getCityAllowlist } from '@/lib/itinerary/iconic-places'
import { ItineraryRequestSchema } from '@/lib/itinerary/schema'
import type { Itinerary } from '@/lib/itinerary/types'
import { validateAndAutoCorrect } from '@/lib/itinerary/validation'

describe('itinerary guardrails', () => {
  it('validates the supported planning request', () => {
    expect(ItineraryRequestSchema.parse({ code: 'FLN001', days: 2, who: 'couple', vibe: 'gastronomy', transport: 'walk' }).locale).toBe('pt')
  })

  it('rejects explicit distances outside the selected transport radius', () => {
    const itinerary: Itinerary = { intro: 'Roteiro.', days: [{ day_number: 1, title: 'Dia', activities: [{ period: 'morning', title: 'Atividade', description: 'Descrição', distance_from_property: '3 km a pé' }] }] }
    expect(validateAndAutoCorrect(itinerary, 1, null, 'walk')).toMatchObject({ kind: 'hard_fail', reason: 'radius_violation' })
    expect(validateAndAutoCorrect({ ...itinerary, days: [{ ...itinerary.days[0]!, activities: [{ ...itinerary.days[0]!.activities[0]!, distance_from_property: '25 km de carro' }] }] }, 1, null, 'car')).toMatchObject({ kind: 'hard_fail', reason: 'radius_violation' })
  })

  it('returns only the selected vibe iconic places', () => {
    const places = getCityAllowlist('Florianópolis', 'gastronomy')
    expect(places?.cardinal).toContain('Lagoa da Conceição')
    expect(places?.vibe).toContain('Box 32 no Mercado Público (frutos do mar)')
    expect(places?.vibe).not.toContain('Praia da Joaquina (surf e sandboard)')
    expect(getCityAllowlist('Cidade não mapeada', 'relax')).toBeNull()
  })

  it('rejects non-sequential days and guide labels without a guide place', () => {
    const itinerary: Itinerary = { intro: 'Roteiro.', days: [{ day_number: 2, title: 'Dia', activities: [{ period: 'morning', title: 'Atividade', description: 'Descrição', place: 'Lugar inventado', from_guide: true }] }] }
    expect(validateAndAutoCorrect(itinerary, 1, null)).toMatchObject({ kind: 'ok' })
  })
})
