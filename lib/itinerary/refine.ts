import type Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_MODEL, anthropic } from '@/lib/anthropic'
import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { resolvePropertyProfiles } from '@/lib/property-profiles'
import { ItineraryError } from './errors'
import { buildRefinementSystemPrompt, buildRefinementUserPrompt } from './refine-prompt'
import type { RefinementTurn } from './refine-schema'
import { ItinerarySchema } from './schema'
import { SUBMIT_ITINERARY_TOOL } from './tool'
import type { Itinerary, ItineraryRequest } from './types'
import { validateAndAutoCorrect } from './validation'

export async function refineItinerary(args: { property: Property; currentItinerary: Itinerary; originalRequest: ItineraryRequest; refinementMessage: string; history: RefinementTurn[]; locale: Locale }, attempt = 1): Promise<Itinerary> {
  const history = args.history.slice(-4)
  let response: Anthropic.Message
  try { response = await anthropic().messages.create({ model: ANTHROPIC_MODEL, max_tokens: 4000, system: buildRefinementSystemPrompt(args.locale), tools: [SUBMIT_ITINERARY_TOOL], tool_choice: { type: 'tool', name: 'submit_itinerary' }, messages: [{ role: 'user', content: buildRefinementUserPrompt({ ...args, history }) }] }, { timeout: 40_000 }) } catch (error) { throw new ItineraryError('Falha na chamada Anthropic no refinement', 502, error) }
  const tool = response.content.find((item): item is Anthropic.ToolUseBlock => item.type === 'tool_use' && item.name === 'submit_itinerary')
  if (!tool) throw new ItineraryError('Não consegui ajustar especificamente esse pedido.', 422)
  const parsed = ItinerarySchema.safeParse(tool.input)
  if (!parsed.success) { if (attempt >= 2) throw new ItineraryError('Não consegui ajustar especificamente esse pedido.', 422, parsed.error); return refineItinerary({ ...args, history: [...args.history, { role: 'user', content: 'Retorne todos os dias completos e atividades válidas.' }] }, 2) }
  const result = validateAndAutoCorrect(parsed.data, args.originalRequest.days, args.property.experiences_guide, args.originalRequest.transport, resolvePropertyProfiles(args.property))
  if (result.kind === 'ok') return result.itinerary
  if (attempt >= 2) throw new ItineraryError(result.reason, 422)
  return refineItinerary({ ...args, history: [...args.history, { role: 'user', content: `Sua tentativa anterior falhou: ${result.reason}. Refaça o roteiro completo dentro das regras.` }] }, 2)
}
