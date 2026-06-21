import type Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_MODEL, anthropic } from '@/lib/anthropic'
import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { ItineraryError } from './errors'
import { buildSystemPrompt, buildUserPrompt } from './prompt'
import { ItinerarySchema } from './schema'
import { SUBMIT_ITINERARY_TOOL } from './tool'
import type { Itinerary, ItineraryRequest } from './types'
import { validateItineraryCoherence } from './validation'

export async function generateItinerary(property: Property, request: ItineraryRequest, locale: Locale): Promise<Itinerary> {
  let response: Anthropic.Message
  try {
    response = await anthropic().messages.create({ model: ANTHROPIC_MODEL, max_tokens: 3000, system: buildSystemPrompt(locale), tools: [SUBMIT_ITINERARY_TOOL], tool_choice: { type: 'tool', name: 'submit_itinerary' }, messages: [{ role: 'user', content: buildUserPrompt({ property, guide: property.experiences_guide, request }) }] }, { timeout: 40_000 })
  } catch (error) {
    throw new ItineraryError('Falha na chamada Anthropic', 502, error)
  }
  const toolUse = response.content.find((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === 'submit_itinerary')
  if (!toolUse) throw new ItineraryError('Claude não chamou submit_itinerary', 502)
  const parsed = ItinerarySchema.safeParse(toolUse.input)
  if (!parsed.success) throw new ItineraryError(`Roteiro inválido: ${parsed.error.message}`, 502, parsed.error)
  validateItineraryCoherence(parsed.data, request.days, property.experiences_guide)
  return parsed.data
}
