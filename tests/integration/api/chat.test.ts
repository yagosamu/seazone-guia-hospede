import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FLN001 } from '@/db/fixtures/fln001'

const chatMocks = vi.hoisted(() => ({ getContext: vi.fn(), streamText: vi.fn(), anthropic: vi.fn() }))

vi.mock('@/lib/chat/context', () => ({ getChatContext: chatMocks.getContext }))
vi.mock('ai', () => ({
  convertToModelMessages: vi.fn(async () => [{ role: 'user', content: 'question' }]),
  smoothStream: vi.fn(() => ({})),
  streamText: chatMocks.streamText,
}))
vi.mock('@ai-sdk/anthropic', () => ({ anthropic: chatMocks.anthropic }))

import { POST } from '@/app/api/chat/route'

const request = (body: unknown) => new Request('http://localhost/api/chat', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})
const message = (text: string) => ({ id: '1', role: 'user', parts: [{ type: 'text', text }] })

describe('POST /api/chat', () => {
  beforeEach(() => {
    Object.values(chatMocks).forEach((mock) => mock.mockReset())
    chatMocks.anthropic.mockReturnValue('mock-model')
    chatMocks.streamText.mockReturnValue({
      toUIMessageStreamResponse: () => new Response('mock-stream', { status: 200 }),
    })
  })

  it('returns 400 for an invalid body', async () => {
    expect((await POST(request({}))).status).toBe(400)
  })

  it('returns 404 when the property context does not exist', async () => {
    chatMocks.getContext.mockResolvedValueOnce(null)
    expect((await POST(request({ code: 'XXX999', messages: [message('Olá')] }))).status).toBe(404)
  })

  it('streams with an anti-hallucination prompt containing property ground truth', async () => {
    chatMocks.getContext.mockResolvedValueOnce({
      property: {
        ...FLN001, experiences_guide: null, experiences_generated_at: null,
        created_at: new Date(), updated_at: new Date(),
      },
      guide: null,
    })
    const response = await POST(request({ code: 'FLN001', messages: [message('Qual a senha do WiFi?')] }))
    const call = chatMocks.streamText.mock.calls[0]?.[0] as { system: string }
    expect(response.status).toBe(200)
    expect(call.system).toContain('SeaHome_FLN001')
    expect(call.system).toContain('floripa2024')
    expect(call.system).toMatch(/nunca invente/i)
  })
})
