import { getPropertyByCode } from '@/db/queries'
import type { Property } from '@/db/schema'
import type { ExperiencesGuide } from '@/db/schemas/experiences'

export type ChatContext = {
  property: Property
  guide: ExperiencesGuide | null
}

export async function getChatContext(code: string): Promise<ChatContext | null> {
  const property = await getPropertyByCode(code)
  if (!property) return null

  return { property, guide: property.experiences_guide ?? null }
}
