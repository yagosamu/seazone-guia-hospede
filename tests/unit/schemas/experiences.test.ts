import { describe, expect, it } from 'vitest'
import { ExperiencesGuideSchema } from '@/db/schemas/experiences'

const validGuide = {
  welcome_message: 'Bem-vindo!',
  restaurants: Array.from({ length: 4 }, (_, index) => ({ name: `R${index}`, distance: '1 km', description: 'Descrição' })),
  attractions: Array.from({ length: 3 }, (_, index) => ({ name: `A${index}`, distance: '1 km', description: 'Descrição' })),
  essentials: Array.from({ length: 3 }, (_, index) => ({ name: `E${index}`, type: 'pharmacy' as const, distance: '1 km', description: 'Descrição' })),
  seasonal_tips: 'Leve um casaco.',
}

describe('ExperiencesGuideSchema', () => {
  it('accepts a guide with four restaurants, three attractions and three essentials', () => {
    expect(ExperiencesGuideSchema.safeParse(validGuide).success).toBe(true)
  })

  it('enforces the restaurant range', () => {
    expect(ExperiencesGuideSchema.safeParse({ ...validGuide, restaurants: validGuide.restaurants.slice(0, 3) }).success).toBe(false)
    expect(ExperiencesGuideSchema.safeParse({
      ...validGuide,
      restaurants: Array.from({ length: 6 }, (_, index) => ({ name: `R${index}`, distance: '1 km', description: 'Descrição' })),
    }).success).toBe(false)
  })

  it('rejects an essential type outside the supported enum', () => {
    expect(ExperiencesGuideSchema.safeParse({
      ...validGuide,
      essentials: [{ name: 'X', type: 'casino', distance: '1 km', description: 'Descrição' }],
    }).success).toBe(false)
  })
})
