import { sql } from 'drizzle-orm'
import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { ExperiencesGuide } from './schemas/experiences'
import type { Address, Amenities, Host, Operational, Rules } from './schemas/property'

export const properties = pgTable('properties', {
  code: text('code').primaryKey(),
  name: text('name').notNull(),
  property_type: text('property_type').notNull(),
  bedroom_quantity: integer('bedroom_quantity').notNull(),
  bathroom_quantity: integer('bathroom_quantity').notNull(),
  guest_capacity: integer('guest_capacity').notNull(),
  address: jsonb('address').$type<Address>().notNull(),
  operational: jsonb('operational').$type<Operational>().notNull(),
  rules: jsonb('rules').$type<Rules>().notNull(),
  amenities: jsonb('amenities').$type<Amenities>().notNull(),
  host: jsonb('host').$type<Host>().notNull(),
  images: text('images').array().notNull().default(sql`ARRAY[]::text[]`),
  welcome_message: text('welcome_message'),
  welcome_generated_at: timestamp('welcome_generated_at'),
  experiences_guide: jsonb('experiences_guide').$type<ExperiencesGuide>(),
  experiences_generated_at: timestamp('experiences_generated_at'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export type Property = typeof properties.$inferSelect
export type NewProperty = typeof properties.$inferInsert
