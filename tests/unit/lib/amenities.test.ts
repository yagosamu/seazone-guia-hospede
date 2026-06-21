import { describe, expect, it } from 'vitest'
import { AMENITY_MAP, getAmenity } from '@/lib/amenities'

describe('getAmenity', () => {
  it('returns the known mapping for wifi', () => {
    expect(getAmenity('wifi').label).toBe('WiFi')
  })

  it('uses a readable fallback for unknown keys', () => {
    expect(getAmenity('garden_view').label).toBe('garden view')
  })

  it('covers every amenity key used by fixtures', () => {
    const fixtureKeys = ['wifi', 'tv', 'air_conditioning', 'kitchen', 'washing_machine', 'elevator', 'balcony', 'pool', 'gym', 'sea_view', 'doorman_24h', 'bbq_grill', 'dishwasher']
    fixtureKeys.forEach((key) => expect(AMENITY_MAP[key]).toBeDefined())
  })
})
