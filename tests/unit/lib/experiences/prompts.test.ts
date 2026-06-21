import { describe, expect, it } from 'vitest'
import { FLN001 } from '@/db/fixtures/fln001'
import type { Property } from '@/db/schema'
import { buildInitialUserMessage, SYSTEM_PROMPT } from '@/lib/experiences/prompts'

const property = {
  ...FLN001,
  experiences_guide: null,
  experiences_generated_at: null,
  created_at: new Date(),
  updated_at: new Date(),
} as Property

const search = { query: 'teste', results: [{ title: 'Lugar Real', url: 'https://example.test', content: 'Conteúdo', score: 1 }] }

describe('experiences prompts', () => {
  it('states the no-invention and additional-search boundaries', () => {
    expect(SYSTEM_PROMPT).toMatch(/nunca invente/i)
    expect(SYSTEM_PROMPT).toMatch(/três buscas adicionais/i)
  })

  it('serializes property details and source URLs into the initial message', () => {
    const message = buildInitialUserMessage({
      property, restaurantsResults: search, attractionsResults: search,
      essentialsResults: search, currentMonth: 'junho',
    })
    expect(message).toContain('Trindade')
    expect(message).toContain('https://example.test')
    expect(message).toContain('junho')
  })
})
