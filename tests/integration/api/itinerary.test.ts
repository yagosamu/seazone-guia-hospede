import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ getProperty: vi.fn(), generate: vi.fn() }))
vi.mock('@/db/queries', () => ({ getPropertyByCode: mocks.getProperty }))
vi.mock('@/lib/itinerary/generate', () => ({ generateItinerary: mocks.generate }))

import { POST } from '@/app/api/itinerary/route'

const request = (body: unknown) => new Request('http://localhost/api/itinerary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const body = { code: 'FLN001', days: 2, who: 'couple', vibe: 'gastronomy', transport: 'mixed' }

describe('POST /api/itinerary', () => {
  beforeEach(() => Object.values(mocks).forEach((mock) => mock.mockReset()))
  it('returns 400 for invalid input', async () => expect((await POST(request({}))).status).toBe(400))
  it('returns 404 for a missing property', async () => {
    mocks.getProperty.mockResolvedValueOnce(null)
    expect((await POST(request(body))).status).toBe(404)
  })
  it('returns a one-shot itinerary in the requested locale', async () => {
    mocks.getProperty.mockResolvedValueOnce({ code: 'FLN001' })
    mocks.generate.mockResolvedValueOnce({ intro: 'Roteiro', days: [] })
    const response = await POST(request({ ...body, locale: 'en' }))
    expect(response.status).toBe(200)
    expect(mocks.generate).toHaveBeenCalledWith({ code: 'FLN001' }, { days: 2, who: 'couple', vibe: 'gastronomy', transport: 'mixed' }, 'en')
  })
})
