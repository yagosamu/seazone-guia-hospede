import { describe, expect, it } from 'vitest'
import {
  AddressSchema,
  AmenitiesSchema,
  HostSchema,
  OperationalSchema,
  RulesSchema,
} from '@/db/schemas/property'

describe('AddressSchema', () => {
  it('accepts a valid address and a null complement', () => {
    expect(AddressSchema.safeParse({
      street: 'Rua X', number: '100', complement: null, neighborhood: 'Centro',
      city: 'Florianópolis', state: 'SC', postal_code: '88036-001',
    }).success).toBe(true)
  })

  it('rejects a state longer than two letters', () => {
    expect(AddressSchema.safeParse({
      street: 'Rua X', number: '100', complement: null, neighborhood: 'Centro',
      city: 'Floripa', state: 'SCC', postal_code: '88036-001',
    }).success).toBe(false)
  })
})

describe('property JSON schemas', () => {
  it('requires times in HH:MM format', () => {
    const rules = {
      check_in_time: '15:00', check_out_time: '11:00', allow_pet: false,
      smoking_permitted: false, suitable_for_children: true, suitable_for_babies: true,
      events_permitted: false,
    }
    expect(RulesSchema.safeParse(rules).success).toBe(true)
    expect(RulesSchema.safeParse({ ...rules, check_in_time: '15h' }).success).toBe(false)
  })

  it('accepts flexible boolean amenities and rejects non-boolean values', () => {
    expect(AmenitiesSchema.safeParse({ wifi: true, foo_bar: false }).success).toBe(true)
    expect(AmenitiesSchema.safeParse({ wifi: 'true' }).success).toBe(false)
  })

  it('validates operational access data and host contact data', () => {
    expect(OperationalSchema.safeParse({
      wifi_network: 'Rede', wifi_password: '123', is_self_checkin: true,
      property_access_type: 'smart_lock', property_access_instructions: 'Use o código',
      property_password: '1234', has_parking_spot: false,
    }).success).toBe(true)
    expect(HostSchema.safeParse({ name: 'Ana', phone: '+55' }).success).toBe(true)
    expect(HostSchema.safeParse({ name: 'Ana' }).success).toBe(false)
  })
})
