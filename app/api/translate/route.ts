import { NextResponse } from 'next/server'
import { z } from 'zod'
import { anthropic, ANTHROPIC_MODEL } from '@/lib/anthropic'

export const runtime = 'nodejs'
export const maxDuration = 30
const BodySchema = z.object({ texts: z.array(z.string()).min(1).max(60), to: z.enum(['en', 'es']) })

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }) }
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', details: parsed.error.issues }, { status: 400 })
  const { texts, to } = parsed.data
  try {
    const response = await anthropic().messages.create({ model: ANTHROPIC_MODEL, max_tokens: 2000, system: `Translate Brazilian Portuguese hospitality copy to ${to === 'en' ? 'natural conversational English' : 'neutral Latin American Spanish'}. Preserve numbers, place names, brands, distances and addresses exactly. No em dashes or AI clichés. Return only JSON: {"translations":[...]}.`, messages: [{ role: 'user', content: texts.map((text, index) => `${index + 1}. ${text}`).join('\n') }] })
    const block = response.content.find((item) => item.type === 'text')
    if (!block || block.type !== 'text') throw new Error('no text output')
    const raw = block.text.trim().replace(/^```(?:json)?\s*|\s*```$/gi, '')
    const result = JSON.parse(raw) as { translations?: unknown }
    if (!Array.isArray(result.translations) || result.translations.length !== texts.length || !result.translations.every((text) => typeof text === 'string')) throw new Error('invalid shape')
    return NextResponse.json({ translations: result.translations })
  } catch (error) {
    console.error('[translate] error', error)
    return NextResponse.json({ error: 'translate_failed' }, { status: 502 })
  }
}
