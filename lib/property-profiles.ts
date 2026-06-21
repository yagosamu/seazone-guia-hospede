import type { Property } from '@/db/schema'

export const PROPERTY_PROFILES = ['coastal', 'mountain', 'urban', 'rural'] as const
export type PropertyProfile = (typeof PROPERTY_PROFILES)[number]

const COASTAL_CITIES = new Set(['Florianópolis', 'Balneário Camboriú', 'Rio de Janeiro'])
const MOUNTAIN_CITIES = new Set(['Gramado'])
const URBAN_CITIES = new Set(['Balneário Camboriú', 'Rio de Janeiro'])

const GUIDE_DIRECTIVES: Record<PropertyProfile, string> = {
  coastal:
    'Priorize praias, orla, restaurantes litorâneos e serviços úteis após um dia de praia, quando esses itens estiverem nos resultados.',
  mountain:
    'Priorize gastronomia, mirantes, passeios internos e opções adequadas para dias frios ou chuvosos, quando esses itens estiverem nos resultados.',
  urban:
    'Priorize mobilidade, cultura, restaurantes e serviços essenciais com deslocamento simples, quando esses itens estiverem nos resultados.',
  rural:
    'Priorize chegada, abastecimento, natureza e planejamento prévio, quando esses itens estiverem nos resultados.',
}

type ProfileProperty = Pick<Property, 'address' | 'amenities'>

export function resolvePropertyProfiles(property: ProfileProperty): PropertyProfile[] {
  const profiles: PropertyProfile[] = []
  const { city } = property.address
  const amenities = property.amenities

  if (COASTAL_CITIES.has(city) || amenities.beachfront || amenities.near_beach || amenities.sea_view) {
    profiles.push('coastal')
  }
  if (MOUNTAIN_CITIES.has(city) || amenities.mountain_view || amenities.heater || amenities.fireplace) {
    profiles.push('mountain')
  }
  if (URBAN_CITIES.has(city) || amenities.doorman_24h) {
    profiles.push('urban')
  }

  return profiles.length > 0 ? profiles : ['rural']
}

export function buildProfileGuidance(
  profiles: PropertyProfile[],
  mode: 'guide' | 'chat',
): string {
  const common =
    mode === 'guide'
      ? 'Os perfis são uma lente de prioridade para selecionar e contextualizar informações existentes. Eles não são fonte de fatos novos. Recomende somente locais presentes nos resultados de busca. Não afirme clima, maré, trânsito, segurança, disponibilidade, horários, acessibilidade ou condições de estrada sem evidência explícita.'
      : 'Use os perfis apenas para priorizar respostas compatíveis com a experiência do imóvel. Não apresente o perfil como fato ao hóspede, não invente locais ou condições locais e preserve as regras anti-alucinação.'

  const directives = profiles
    .map((profile) => `${profile.toUpperCase()}: ${GUIDE_DIRECTIVES[profile]}`)
    .join('\n')

  return `PERFIS ATIVOS DESTE IMÓVEL: ${profiles.join(', ')}\n${common}\n${directives}`
}
