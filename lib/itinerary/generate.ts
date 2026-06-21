import type Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_MODEL, anthropic } from '@/lib/anthropic'
import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { resolvePropertyProfiles } from '@/lib/property-profiles'
import { ItineraryError } from './errors'
import { buildSystemPrompt, buildUserPrompt } from './prompt'
import { ItinerarySchema } from './schema'
import { SUBMIT_ITINERARY_TOOL } from './tool'
import type { Itinerary, ItineraryRequest } from './types'
import { validateAndAutoCorrect } from './validation'

export async function generateItinerary(property: Property, request: ItineraryRequest, locale: Locale, attempt = 1, feedback = ''): Promise<Itinerary> {
  let response: Anthropic.Message
  try { response = await anthropic().messages.create({ model: ANTHROPIC_MODEL, max_tokens: 4000, system: buildSystemPrompt(locale), tools: [SUBMIT_ITINERARY_TOOL], tool_choice: { type: 'tool', name: 'submit_itinerary' }, messages: [{ role: 'user', content: `${buildUserPrompt({ property, guide: property.experiences_guide, request })}\n${feedback}` }] }, { timeout: 40_000 }) } catch (error) { throw new ItineraryError('Falha na chamada Anthropic', 502, error) }
  const tool = response.content.find((item): item is Anthropic.ToolUseBlock => item.type === 'tool_use' && item.name === 'submit_itinerary')
  if (!tool) throw new ItineraryError('Não conseguimos montar o roteiro agora.', 422)
  const parsed = ItinerarySchema.safeParse(tool.input)
  if (!parsed.success) { if (attempt >= 2) throw new ItineraryError('Não conseguimos montar o roteiro agora.', 422); return generateItinerary(property, request, locale, 2, 'Retorne um roteiro completo, estruturado e válido.') }
  const result = validateAndAutoCorrect(parsed.data, request.days, property.experiences_guide, request.transport, resolvePropertyProfiles(property))
  if (result.kind === 'ok') return result.itinerary
  if (attempt >= 2) throw new ItineraryError(result.reason, 422)
  return generateItinerary(property, request, locale, 2, `Sua tentativa anterior violou: ${result.reason}. Respeite transporte ${request.transport}, perfis e ${request.days} dias completos.`)
}
