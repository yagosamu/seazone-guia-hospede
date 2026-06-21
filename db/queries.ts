import { eq } from 'drizzle-orm'
import { db } from './client'
import { properties, type Property } from './schema'
import type { ExperiencesGuide } from './schemas/experiences'

export async function getPropertyByCode(code: string): Promise<Property | null> {
  const normalized = code.trim().toUpperCase()
  const rows = await db.select().from(properties).where(eq(properties.code, normalized)).limit(1)

  return rows[0] ?? null
}

export async function saveExperiencesGuide(code: string, guide: ExperiencesGuide): Promise<void> {
  await db
    .update(properties)
    .set({
      experiences_guide: guide,
      experiences_generated_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(properties.code, code.toUpperCase()))
}

export async function saveWelcomeMessage(code: string, message: string): Promise<void> {
  await db
    .update(properties)
    .set({
      welcome_message: message,
      welcome_generated_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(properties.code, code.toUpperCase()))
}
