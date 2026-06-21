import type { ExperiencesGuide } from '@/db/schemas/experiences'
import type { Property } from '@/db/schema'
import type { Locale } from '@/lib/i18n/types'
import { resolvePropertyProfiles } from '@/lib/property-profiles'
import { getCityAllowlist } from './iconic-places'
import type { ItineraryRequest } from './types'

const LANGUAGE: Record<Locale, string> = { pt: 'Responda em Português brasileiro natural.', en: 'Respond in natural conversational English. Keep place names in Portuguese.', es: 'Responde en Español neutral hispanoamericano. Conserva los nombres de lugares en portugués.' }
const WHO = { couple: 'Casal, experiências a dois.', family_with_kids: 'Família com crianças, ritmo confortável e atividades adequadas.', solo: 'Viagem solo, autonomia e locais apropriados para estar sozinho.', friends: 'Grupo de amigos, atividades em grupo e vida social.' }
const VIBE = { relax: 'Relaxar, sem rotina apertada e atividades calmas.', adventure: 'Aventura, atividades ao ar livre e exploração.', gastronomy: 'Gastronomia, restaurantes e experiências culinárias.', culture: 'Cultura, arte, história e arquitetura.', nightlife: 'Vida noturna, bares e programas após as 18h.' }

export function buildSystemPrompt(locale: Locale): string {
  return `Você é um curador local especialista em hospitalidade no Brasil. Monte um roteiro personalizado para hóspedes.
${LANGUAGE[locale]}
REGRAS:
1. Use o guide do imóvel como base e marque from_guide: true apenas quando place corresponder exatamente a um lugar do guide.
2. Você pode complementar o roteiro apenas com os ícones reconhecidos fornecidos no contexto. Fora do guide e dessa lista, use tipos genéricos, sem nomes próprios.
3. Respeite perfis do imóvel, restrições, quem viaja e vibe. Não sugira praia para perfil mountain nem programa de serra para coastal.
4. Nunca invente ou repita horários, preços, disponibilidade, necessidade de reserva, clima, maré, eventos datados, segurança ou condições de estrada. Mesmo que o guide mencione esses detalhes, descreva apenas a experiência proposta.
5. Família com crianças exige ritmo mais lento. Para nightlife, não proponha atividades antes das 18h.
6. Cada dia tem de 2 a 4 atividades, distribuídas entre manhã, tarde e noite quando fizer sentido.
7. Descrições têm 1-2 frases, sem travessões longos, emojis ou clichês de IA.
8. Chame submit_itinerary exatamente uma vez.`
}

export function buildUserPrompt({ property, guide, request }: { property: Property; guide: ExperiencesGuide | null; request: ItineraryRequest }): string {
  const allowlist = getCityAllowlist(property.address.city, request.vibe)
  const iconic = allowlist ? `\nÍCONES RECONHECIDOS DA REGIÃO (você pode mencionar mesmo fora do guide):\n- Sempre apropriados: ${allowlist.cardinal.join('; ')}\n- Para esta vibe: ${allowlist.vibe.join('; ') || 'nenhum'}\nFora desta lista e do guide, prefira tipos genéricos.` : ''
  return `IMÓVEL
Nome: ${property.name}
Tipo: ${property.property_type}
Bairro: ${property.address.neighborhood}
Cidade: ${property.address.city} / ${property.address.state}
Perfis: ${resolvePropertyProfiles(property).join(', ')}

ESCOLHAS DO HÓSPEDE
Dias: ${request.days}
Quem viaja: ${WHO[request.who]}
Vibe desejada: ${VIBE[request.vibe]}
${request.restrictions ? `Restrições/preferências: ${request.restrictions}` : ''}

GUIA DE EXPERIÊNCIAS DA REGIÃO
${guide ? formatGuide(guide) : '(Guide ainda não gerado. Use somente ícones reconhecidos ou tipos genéricos.)'}${iconic}

Monte o roteiro completo e chame submit_itinerary.`
}

function formatGuide(guide: ExperiencesGuide): string {
  const places = [...guide.restaurants, ...guide.attractions, ...guide.essentials]
  return places.map((place) => `- ${place.name} (${place.distance}): ${place.description}`).join('\n')
}
