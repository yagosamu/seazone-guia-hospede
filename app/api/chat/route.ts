import { NextResponse } from 'next/server'
import { anthropic } from '@ai-sdk/anthropic'
import {
  convertToModelMessages,
  smoothStream,
  streamText,
  type UIMessage,
} from 'ai'
import { z } from 'zod'
import { getChatContext } from '@/lib/chat/context'
import { buildSystemPrompt } from '@/lib/chat/prompt'

export const maxDuration = 30
export const runtime = 'nodejs'

const BodySchema = z.object({
  code: z.string().min(1),
  messages: z.array(z.any()).min(1),
  locale: z.enum(['pt', 'en', 'es']).optional().default('pt'),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_body', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const context = await getChatContext(parsed.data.code)
  if (!context) {
    return NextResponse.json({ error: 'property_not_found' }, { status: 404 })
  }

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: buildSystemPrompt(context, parsed.data.locale),
      messages: await convertToModelMessages(parsed.data.messages as UIMessage[]),
      temperature: 0.3,
      maxOutputTokens: 600,
      experimental_transform: smoothStream({ delayInMs: 18, chunking: 'word' }),
    })

    // ai@6.0.208 exposes the UI-message SSE adapter on StreamTextResult itself.
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[chat] error:', error)
    return NextResponse.json({ error: 'chat_failed' }, { status: 502 })
  }
}
