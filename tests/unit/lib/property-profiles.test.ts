import { describe, expect, it } from 'vitest'
import { BAL001 } from '@/db/fixtures/bal001'
import { FLN001 } from '@/db/fixtures/fln001'
import { GRM001 } from '@/db/fixtures/grm001'
import { RJ001 } from '@/db/fixtures/rj001'
import { resolvePropertyProfiles } from '@/lib/property-profiles'

describe('resolvePropertyProfiles', () => {
  it('derives expected profiles from the four fixtures', () => {
    expect(resolvePropertyProfiles(FLN001)).toEqual(['coastal'])
    expect(resolvePropertyProfiles(GRM001)).toEqual(['mountain'])
    expect(resolvePropertyProfiles(BAL001)).toEqual(['coastal', 'urban'])
    expect(resolvePropertyProfiles(RJ001)).toEqual(['coastal', 'urban'])
  })

  it('uses rural as the deterministic fallback', () => {
    expect(
      resolvePropertyProfiles({
        ...FLN001,
        address: { ...FLN001.address, city: 'Interior' },
        amenities: {},
      }),
    ).toEqual(['rural'])
  })
})
