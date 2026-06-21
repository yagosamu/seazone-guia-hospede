import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { getCityAllowlist } from './iconic-places'
import type { RefinementTurn } from './refine-schema'
import type { Itinerary, ItineraryRequest } from './types'
import { resolvePropertyProfiles } from '@/lib/property-profiles'

export function buildRefinementSystemPrompt(locale: Locale) { return `Você está refinando um roteiro. ${locale === 'en' ? 'Respond in natural English.' : locale === 'es' ? 'Responde en español neutral.' : 'Responda em português brasileiro.'} Mantenha o mesmo número de dias, mude apenas o pedido, respeite perfis, transporte, allowlist e restrições. Retorne o roteiro completo por submit_itinerary exatamente uma vez, sem horários, preços, clima ou markdown.` }
export function buildRefinementUserPrompt({ property, currentItinerary, originalRequest, refinementMessage, history }: { property: Property; currentItinerary: Itinerary; originalRequest: ItineraryRequest; refinementMessage: string; history: RefinementTurn[] }) { const list = getCityAllowlist(property.address.city, originalRequest.vibe); return `IMÓVEL: ${property.name}, ${property.address.city}. PERFIS: ${resolvePropertyProfiles(property).join(', ')}. TRANSPORTE: ${originalRequest.transport}. ÍCONES: ${list ? [...list.cardinal, ...list.vibe].join(', ') : 'somente guide e tipos genéricos'}. HISTÓRICO: ${history.map(t => `${t.role}: ${t.content}`).join('\n')} ROTEIRO ATUAL: ${JSON.stringify(currentItinerary)} PEDIDO: ${refinementMessage}` }
