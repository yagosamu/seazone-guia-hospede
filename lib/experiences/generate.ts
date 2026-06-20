import type Anthropic from '@anthropic-ai/sdk'
import { anthropic, ANTHROPIC_MODEL, MAX_TOKENS_PER_TURN } from '@/lib/anthropic'
import type { Property } from '@/db/schema'
import { ExperiencesGuideSchema, type ExperiencesGuide } from '@/db/schemas/experiences'
import { tavilySearch, type TavilyResponse } from '@/lib/tavily'
import { AnthropicError, MaxIterationsError, TavilyError, ValidationError } from './errors'
import { buildInitialUserMessage, SYSTEM_PROMPT } from './prompts'
import { ALL_TOOLS } from './tools'

export const MAX_ITERATIONS = 8
const MAX_ADDITIONAL_SEARCHES = 3
const ANTHROPIC_TURN_TIMEOUT_MS = 30_000
const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const

type GenerateOptions = { signal?: AbortSignal }

export async function generateExperiencesGuide(
  property: Property,
  options: GenerateOptions = {},
): Promise<ExperiencesGuide> {
  const startedAt = Date.now()
  const { address } = property
  const location = `${address.neighborhood}, ${address.city} ${address.state}`
  const cityState = `${address.city} ${address.state}`

  let restaurants: TavilyResponse
  let attractions: TavilyResponse
  let essentials: TavilyResponse
  try {
    ;[restaurants, attractions, essentials] = await Promise.all([
      tavilySearch(`melhores restaurantes em ${location}`, { signal: options.signal }),
      tavilySearch(`atrações turísticas e o que fazer em ${cityState}`, { signal: options.signal }),
      tavilySearch(`farmácia 24 horas supermercado hospital perto de ${location}`, { signal: options.signal }),
    ])
  } catch (error) {
    throw new TavilyError('Falha no pre-fetch Tavily', error)
  }
  console.log(`[generate-guide] prefetch done in ${Date.now() - startedAt}ms`)

  const messages: Anthropic.MessageParam[] = [{
    role: 'user',
    content: buildInitialUserMessage({
      property,
      restaurantsResults: restaurants,
      attractionsResults: attractions,
      essentialsResults: essentials,
      currentMonth: MONTHS_PT[new Date().getMonth()] ?? 'mês atual',
    }),
  }]
  let additionalSearches = 0

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration += 1) {
    const turnStartedAt = Date.now()
    let response: Anthropic.Message
    try {
      response = await anthropic().messages.create(
        {
          model: ANTHROPIC_MODEL,
          max_tokens: MAX_TOKENS_PER_TURN,
          system: SYSTEM_PROMPT,
          tools: ALL_TOOLS,
          tool_choice: iteration === MAX_ITERATIONS
            ? { type: 'tool', name: 'submit_guide' }
            : { type: 'auto' },
          messages,
        },
        { timeout: ANTHROPIC_TURN_TIMEOUT_MS, signal: options.signal },
      )
    } catch (error) {
      throw new AnthropicError(`Falha na chamada Anthropic (iter ${iteration})`, error)
    }
    console.log(
      `[generate-guide] iter ${iteration} done in ${Date.now() - turnStartedAt}ms (stop: ${response.stop_reason})`,
    )
    messages.push({ role: 'assistant', content: response.content })

    if (response.stop_reason !== 'tool_use') {
      throw new AnthropicError(
        `Claude parou sem tool_use (stop_reason=${response.stop_reason}) na iter ${iteration}`,
      )
    }

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
    )
    if (toolUseBlocks.length === 0) {
      throw new AnthropicError('stop_reason=tool_use mas nenhum bloco tool_use encontrado')
    }
    console.log(
      `[generate-guide] iter ${iteration} tools: ${toolUseBlocks.map((toolUse) => toolUse.name).join(', ')}`,
    )

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const toolUse of toolUseBlocks) {
      if (toolUse.name === 'submit_guide') {
        const validated = ExperiencesGuideSchema.safeParse(toolUse.input)
        if (!validated.success) {
          throw new ValidationError(
            `submit_guide com input inválido: ${validated.error.message}`,
            validated.error,
          )
        }
        console.log(`[generate-guide] completed in ${Date.now() - startedAt}ms (${iteration} iterations)`)
        return validated.data
      }

      if (toolUse.name === 'tavily_search') {
        const query = readSearchQuery(toolUse.input)
        if (!query) {
          toolResults.push(toolError(toolUse.id, 'Erro: parâmetro "query" ausente'))
          continue
        }
        if (additionalSearches >= MAX_ADDITIONAL_SEARCHES) {
          toolResults.push(toolError(toolUse.id, 'Erro: limite de 3 buscas adicionais atingido'))
          continue
        }
        additionalSearches += 1
        try {
          const result = await tavilySearch(query, { signal: options.signal })
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: formatSearchForLLM(result),
          })
        } catch (error) {
          toolResults.push(toolError(toolUse.id, `Erro na busca: ${errorMessage(error)}`))
        }
        continue
      }

      toolResults.push(toolError(toolUse.id, `Tool desconhecida: ${toolUse.name}`))
    }
    messages.push({ role: 'user', content: toolResults })
  }

  throw new MaxIterationsError()
}

function readSearchQuery(input: unknown): string | null {
  if (typeof input !== 'object' || !input || !('query' in input)) return null
  const query = input.query
  return typeof query === 'string' && query.trim() ? query.trim() : null
}

function toolError(toolUseId: string, content: string): Anthropic.ToolResultBlockParam {
  return { type: 'tool_result', tool_use_id: toolUseId, content, is_error: true }
}

function formatSearchForLLM(response: TavilyResponse): string {
  if (!response.results.length) return '(nenhum resultado encontrado)'
  return response.results
    .slice(0, 5)
    .map((result, index) => `[${index + 1}] ${result.title}\n${result.content}`)
    .join('\n\n')
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'erro desconhecido'
}
