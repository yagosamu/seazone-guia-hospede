import { inArray } from 'drizzle-orm'
import { db } from './client'
import { BAL001 } from './fixtures/bal001'
import { FLN001 } from './fixtures/fln001'
import { GRM001 } from './fixtures/grm001'
import { RJ001 } from './fixtures/rj001'
import { properties, type NewProperty } from './schema'
import {
  AddressSchema,
  AmenitiesSchema,
  HostSchema,
  OperationalSchema,
  RulesSchema,
} from './schemas/property'

function validateFixture(property: NewProperty): void {
  AddressSchema.parse(property.address)
  OperationalSchema.parse(property.operational)
  RulesSchema.parse(property.rules)
  AmenitiesSchema.parse(property.amenities)
  HostSchema.parse(property.host)
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('✗ DATABASE_URL not set. Aborting.')
    process.exit(1)
  }

  console.log('→ Validating fixtures with Zod...')
  validateFixture(FLN001)
  validateFixture(GRM001)
  validateFixture(BAL001)
  validateFixture(RJ001)

  console.log('→ Replacing FLN001, GRM001, BAL001 and RJ001...')
  // Delete then insert keeps the seed idempotent without maintaining an excluded-column map.
  await db.transaction(async (tx) => {
    await tx
      .delete(properties)
      .where(inArray(properties.code, [FLN001.code, GRM001.code, BAL001.code, RJ001.code]))
    await tx.insert(properties).values([FLN001, GRM001, BAL001, RJ001])
  })

  console.log('✓ Seed completed')
}

main().catch((error: unknown) => {
  console.error('✗ Seed failed:', error)
  process.exitCode = 1
})
