import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { getCityAllowlist } from './iconic-places'
import type { RefinementTurn } from './refine-schema'
import type { Itinerary, ItineraryRequest } from './types'
import { resolvePropertyProfiles } from '@/lib/property-profiles'

export function buildRefinementSystemPrompt(locale: Locale) { return `Você está refinando um roteiro. ${locale === 'en' ? 'Respond in natural English.' : locale === 'es' ? 'Responde en español neutral.' : 'Responda em português brasileiro.'} Mantenha o mesmo número de dias, mude apenas o pedido, respeite perfis, transporte, allowlist e restrições. Retorne o roteiro completo por submit_itinerary exatamente uma vez, sem horários, preços, clima ou markdown.
9. SEMPRE retorne TODOS os dias do roteiro, numerados sequencialmente de 1 até o total original.
10. Cada dia precisa ter ao menos uma atividade.
11. Use from_guide:true APENAS para um lugar que existe literalmente no guide cacheado. Lugares novos devem ter from_guide:false ou omitir o campo.
12. Transporte é preferência: para walk priorize até ~2,5 km, mas sinalize carro/Uber para ícones mais distantes.
EXEMPLO: se o roteiro atual tem 2 dias e o hóspede pede algo no dia 2, retorne 2 dias completos: dia 1 preservado e dia 2 ajustado. Nunca retorne só o dia alterado. Se o pedido pontual conflita com a vibe original, atenda apenas esse pedido sem substituir todo o roteiro.` }
export function buildRefinementUserPrompt({ property, currentItinerary, originalRequest, refinementMessage, history }: { property: Property; currentItinerary: Itinerary; originalRequest: ItineraryRequest; refinementMessage: string; history: RefinementTurn[] }) { const list = getCityAllowlist(property.address.city, originalRequest.vibe); return `IMÓVEL: ${property.name}, ${property.address.city}. PERFIS: ${resolvePropertyProfiles(property).join(', ')}. TRANSPORTE: ${originalRequest.transport}. ÍCONES: ${list ? [...list.cardinal, ...list.vibe].join(', ') : 'somente guide e tipos genéricos'}. HISTÓRICO: ${history.map(t => `${t.role}: ${t.content}`).join('\n')} ROTEIRO ATUAL: ${JSON.stringify(currentItinerary)} PEDIDO: ${refinementMessage}` }
