import { z } from 'zod'

export const AddressSchema = z.object({
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string().length(2),
  postal_code: z.string(),
})

export const PropertyAccessTypeSchema = z.enum([
  'smart_lock',
  'keybox',
  'reception',
  'in_person',
  'other',
])

export const OperationalSchema = z.object({
  wifi_network: z.string(),
  wifi_password: z.string(),
  is_self_checkin: z.boolean(),
  property_access_type: PropertyAccessTypeSchema,
  property_access_instructions: z.string(),
  property_password: z.string().nullable().optional(),
  has_parking_spot: z.boolean(),
  parking_spot_identifier: z.string().nullable().optional(),
  parking_spot_instructions: z.string().nullable().optional(),
})

export const RulesSchema = z.object({
  check_in_time: z.string().regex(/^\d{2}:\d{2}$/),
  check_out_time: z.string().regex(/^\d{2}:\d{2}$/),
  allow_pet: z.boolean(),
  smoking_permitted: z.boolean(),
  suitable_for_children: z.boolean(),
  suitable_for_babies: z.boolean(),
  events_permitted: z.boolean(),
})

export const AmenitiesSchema = z.record(z.string(), z.boolean())

export const HostSchema = z.object({
  name: z.string(),
  phone: z.string(),
})

export type Address = z.infer<typeof AddressSchema>
export type Operational = z.infer<typeof OperationalSchema>
export type Rules = z.infer<typeof RulesSchema>
export type Amenities = z.infer<typeof AmenitiesSchema>
export type Host = z.infer<typeof HostSchema>
