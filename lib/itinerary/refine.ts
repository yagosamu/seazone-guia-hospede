import type Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_MODEL, anthropic } from '@/lib/anthropic'
import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { ItineraryError } from './errors'
import { buildRefinementSystemPrompt, buildRefinementUserPrompt } from './refine-prompt'
import type { RefinementTurn } from './refine-schema'
import { ItinerarySchema } from './schema'
import { SUBMIT_ITINERARY_TOOL } from './tool'
import type { Itinerary, ItineraryRequest } from './types'
import { validateItineraryCoherence } from './validation'

export async function refineItinerary(args: { property: Property; currentItinerary: Itinerary; originalRequest: ItineraryRequest; refinementMessage: string; history: RefinementTurn[]; locale: Locale }): Promise<Itinerary> {
  const recentHistory = args.history.slice(-4)
  let response: Anthropic.Message
  try {
    response = await anthropic().messages.create({ model: ANTHROPIC_MODEL, max_tokens: 2500, system: buildRefinementSystemPrompt(args.locale), tools: [SUBMIT_ITINERARY_TOOL], tool_choice: { type: 'tool', name: 'submit_itinerary' }, messages: [{ role: 'user', content: buildRefinementUserPrompt({ ...args, history: recentHistory }) }] }, { timeout: 40_000 })
  } catch (error) { throw new ItineraryError('Falha na chamada Anthropic no refinement', 502, error) }
  const block = response.content.find((item): item is Anthropic.ToolUseBlock => item.type === 'tool_use' && item.name === 'submit_itinerary')
  if (!block) throw new ItineraryError('Claude não chamou submit_itinerary no refinement', 502)
  const parsed = ItinerarySchema.safeParse(block.input)
  if (!parsed.success) { console.error('[itinerary.refine] Zod issues', parsed.error.issues); throw new ItineraryError('O roteiro retornado não está completo. Tente reformular o pedido.', 502, parsed.error) }
  try { validateItineraryCoherence(parsed.data, args.originalRequest.days, args.property.experiences_guide, args.originalRequest.transport) } catch (error) { console.error('[itinerary.refine] coherence error', error); throw error }
  return parsed.data
}
