import type Anthropic from '@anthropic-ai/sdk'

export const TAVILY_SEARCH_TOOL: Anthropic.Tool = {
  name: 'tavily_search',
  description:
    'Busca conteúdo real na web sobre lugares, restaurantes, atrações, eventos ou dicas locais. Use quando precisar de informação específica que não está presente no contexto inicial. Sempre busque em português brasileiro.',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Query de busca em português brasileiro, específica para a necessidade atual.',
      },
    },
    required: ['query'],
  },
}

export const SUBMIT_GUIDE_TOOL: Anthropic.Tool = {
  name: 'submit_guide',
  description:
    'Submete o guia final estruturado para o hóspede. Use somente após reunir todas as informações necessárias.',
  input_schema: {
    type: 'object',
    properties: {
      restaurants: {
        type: 'array',
        minItems: 4,
        maxItems: 5,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            distance: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['name', 'distance', 'description'],
        },
      },
      attractions: {
        type: 'array',
        minItems: 3,
        maxItems: 4,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            distance: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['name', 'distance', 'description'],
        },
      },
      essentials: {
        type: 'array',
        minItems: 3,
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['pharmacy', 'market', 'hospital', 'gas_station', 'bank', 'other'],
            },
            distance: { type: 'string' },
            description: { type: 'string' },
          },
          required: ['name', 'type', 'distance', 'description'],
        },
      },
      seasonal_tips: {
        type: 'string',
        description: 'Dica sazonal local para o mês atual, em 2 a 3 frases.',
      },
    },
    required: ['restaurants', 'attractions', 'essentials', 'seasonal_tips'],
  },
}

export const ALL_TOOLS = [TAVILY_SEARCH_TOOL, SUBMIT_GUIDE_TOOL]
