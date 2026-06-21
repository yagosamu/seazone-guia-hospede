import { describe, expect, it } from 'vitest'
import { FLN001 } from '@/db/fixtures/fln001'
import { GRM001 } from '@/db/fixtures/grm001'
import type { ExperiencesGuide } from '@/db/schemas/experiences'
import type { Property } from '@/db/schema'
import { buildSystemPrompt } from '@/lib/chat/prompt'

function propertyFromFixture(fixture: typeof FLN001 | typeof GRM001): Property {
  return {
    ...fixture,
    welcome_message: null,
    welcome_generated_at: null,
    experiences_guide: null,
    experiences_generated_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  } as Property
}

const guide: ExperiencesGuide = {
  restaurants: ['Moochacho Burritos', 'R2', 'R3', 'R4'].map((name) => ({ name, distance: '1 km', description: 'Descrição' })),
  attractions: ['A1', 'A2', 'A3'].map((name) => ({ name, distance: '1 km', description: 'Descrição' })),
  essentials: ['E1', 'E2', 'E3'].map((name) => ({ name, type: 'pharmacy' as const, distance: '1 km', description: 'Descrição' })),
  seasonal_tips: 'Frio.',
}

describe('buildSystemPrompt anti-hallucination contract', () => {
  it('includes the official WiFi ground truth exactly', () => {
    const prompt = buildSystemPrompt({ property: propertyFromFixture(FLN001), guide: null })
    expect(prompt).toContain('SeaHome_FLN001')
    expect(prompt).toContain('floripa2024')
  })

  it('represents the official pet ground truth for both properties', () => {
    expect(buildSystemPrompt({ property: propertyFromFixture(FLN001), guide: null })).toContain('Permite animais (pet): Não')
    expect(buildSystemPrompt({ property: propertyFromFixture(GRM001), guide: null })).toContain('Permite animais (pet): Sim')
  })

  it('includes the official FLN001 check-in ground truth', () => {
    const prompt = buildSystemPrompt({ property: propertyFromFixture(FLN001), guide: null })
    expect(prompt).toContain('15:00')
    expect(prompt).toContain('11:00')
  })

  it('includes restaurants from the cached guide and no-guide disclosure', () => {
    expect(buildSystemPrompt({ property: propertyFromFixture(FLN001), guide })).toContain('Moochacho Burritos')
    expect(buildSystemPrompt({ property: propertyFromFixture(FLN001), guide: null })).toMatch(/ainda não foi gerado/i)
  })

  it('contains explicit anti-hallucination and host redirection rules', () => {
    const prompt = buildSystemPrompt({ property: propertyFromFixture(FLN001), guide: null })
    expect(prompt).toMatch(/nunca invente/i)
    expect(prompt).toContain('Não tenho essa informação sobre este imóvel')
    expect(prompt).toContain('Ana Paula')
    expect(prompt).toMatch(/travess(ão|ões)/i)
  })
})
