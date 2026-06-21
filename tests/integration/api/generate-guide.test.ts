import { beforeEach, describe, expect, it, vi } from 'vitest'

const apiMocks = vi.hoisted(() => ({ getProperty: vi.fn(), saveGuide: vi.fn(), generate: vi.fn() }))

vi.mock('@/db/queries', () => ({
  getPropertyByCode: apiMocks.getProperty,
  saveExperiencesGuide: apiMocks.saveGuide,
}))
vi.mock('@/lib/experiences/generate', () => ({ generateExperiencesGuide: apiMocks.generate }))

import { POST } from '@/app/api/generate-guide/route'

const request = (body: unknown) => new Request('http://localhost/api/generate-guide', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

const guide = { welcome_message: 'Olá', restaurants: [], attractions: [], essentials: [], seasonal_tips: 'Dica' }

describe('POST /api/generate-guide', () => {
  beforeEach(() => Object.values(apiMocks).forEach((mock) => mock.mockReset()))

  it('returns 400 for an invalid body', async () => {
    expect((await POST(request({}))).status).toBe(400)
  })

  it('returns 404 for a missing property', async () => {
    apiMocks.getProperty.mockResolvedValueOnce(null)
    expect((await POST(request({ code: 'XXX999' }))).status).toBe(404)
  })

  it('returns a fresh database cache without generating again', async () => {
    apiMocks.getProperty.mockResolvedValueOnce({ code: 'FLN001', experiences_guide: guide, experiences_generated_at: new Date() })
    const response = await POST(request({ code: 'FLN001' }))
    expect((await response.json()).cached).toBe(true)
    expect(apiMocks.generate).not.toHaveBeenCalled()
  })

  it('generates and saves a guide on a cache miss', async () => {
    apiMocks.getProperty.mockResolvedValueOnce({ code: 'FLN001', experiences_guide: null, experiences_generated_at: null })
    apiMocks.generate.mockResolvedValueOnce(guide)
    const response = await POST(request({ code: 'FLN001' }))
    expect((await response.json()).cached).toBe(false)
    expect(apiMocks.saveGuide).toHaveBeenCalledWith('FLN001', guide)
  })

  it('regenerates when force is true even when a cache exists', async () => {
    apiMocks.getProperty.mockResolvedValueOnce({ code: 'FLN001', experiences_guide: guide, experiences_generated_at: new Date() })
    apiMocks.generate.mockResolvedValueOnce(guide)
    await POST(request({ code: 'FLN001', force: true }))
    expect(apiMocks.generate).toHaveBeenCalled()
  })
})
