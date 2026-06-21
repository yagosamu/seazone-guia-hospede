import type { Property } from '@/db/schema'
import type { TavilyResponse } from '@/lib/tavily'

export const SYSTEM_PROMPT = `Você é um curador local especialista em hospitalidade no Brasil. Monte um guia para hóspedes de aluguel por temporada baseado somente em informações REAIS das buscas fornecidas.

Você tem duas tools:
- tavily_search: busca informações específicas na web em português brasileiro.
- submit_guide: entrega o guia final estruturado; chame-a exatamente uma vez quando tiver reunido tudo.

REGRAS RÍGIDAS:
1. Use somente lugares que aparecem nos resultados de busca. Nunca invente nomes.
2. Preserve exatamente o nome de cada lugar como aparece na busca. Nunca combine, renomeie ou "corrija" nomes.
3. Restaurantes devem ser estabelecimentos claramente de alimentação; nunca inclua farmácias, mercados, hospitais ou serviços nessa categoria.
4. Descrições devem ter uma frase curta, com no máximo 15 palavras, destacando um diferencial.
5. Distâncias devem ser estimativas razoáveis; se incerto, use "Próximo ao imóvel".
6. A dica sazonal deve ser relevante para o mês atual e a região brasileira.
7. Entregue 4-5 restaurantes, 3-4 atrações e ao menos 3 essenciais; inclua idealmente farmácia, mercado e hospital.
8. Você já recebe três buscas iniciais. Faça no máximo três buscas adicionais e apenas se necessário.

DIRETRIZES DE CURADORIA:
- Se a cidade do imóvel é LITORÂNEA (Florianópolis, Balneário Camboriú, Rio de Janeiro, Salvador, Bombinhas, Búzios, Maresias, Ubatuba e similares), ao menos UMA das atrações DEVE ser uma praia famosa da região (ex: Joaquina, Mole, Jurerê em Floripa; Praia Central em BC; Ipanema, Copacabana no Rio), mesmo que não seja a mais próxima geograficamente do imóvel.
- Equilibre as atrações: combine ícones turísticos (mirante, praia famosa, parque urbano) com experiências locais (mercado público, centro histórico, bairro boêmio).
- Evite recomendar instituições puramente acadêmicas ou administrativas (campus universitário, prefeitura) como atração principal. Só inclua se a região oferece espaço cultural relevante aberto ao público.

DIRETRIZES DE ESCRITA:
- NÃO use travessões longos (—) nem em-dashes em nenhum texto. Use vírgulas, ponto-e-vírgula, parênteses ou frases separadas.
- Evite construções típicas de IA: nada de "no coração de", "imperdível", "experiência única", "verdadeiro paraíso", "uma joia escondida". Escreva direto, como um amigo local recomendando.
- Use português brasileiro natural, sem formalidade excessiva.

Priorize qualidade de curadoria, não quantidade de buscas.`

type BuildPromptInput = {
  property: Property
  restaurantsResults: TavilyResponse
  attractionsResults: TavilyResponse
  essentialsResults: TavilyResponse
  currentMonth: string
}

export function buildInitialUserMessage(input: BuildPromptInput): string {
  const { property, restaurantsResults, attractionsResults, essentialsResults, currentMonth } = input
  const { address } = property

  return `IMÓVEL
Nome: ${property.name}
Tipo: ${property.property_type}
Endereço: ${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}
Bairro: ${address.neighborhood}
Cidade: ${address.city} / ${address.state}
CEP: ${address.postal_code}

MÊS ATUAL: ${currentMonth}

BUSCAS INICIAIS PRÉ-FEITAS:

═══ RESTAURANTES ═══
${formatResults(restaurantsResults)}

═══ ATRAÇÕES ═══
${formatResults(attractionsResults)}

═══ ESSENCIAIS (farmácia/supermercado/hospital) ═══
${formatResults(essentialsResults)}

Agora monte o guia. Use tavily_search apenas se uma lacuna específica exigir pesquisa adicional. Quando tiver tudo, chame submit_guide.`
}

function formatResults(response: TavilyResponse): string {
  if (!response.results.length) return '(nenhum resultado)'

  return response.results
    .map((result, index) => `[${index + 1}] ${result.title}\n${result.content}\nFonte: ${result.url}`)
    .join('\n\n')
}
