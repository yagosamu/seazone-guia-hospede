import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPropertyByCode, saveWelcomeMessage } from '@/db/queries'
import { generateWelcomeMessage, WelcomeGenerationError } from '@/lib/welcome/generate'

export const maxDuration = 30
export const runtime = 'nodejs'

const BodySchema = z.object({
  code: z.string().min(1),
  force: z.boolean().optional(),
})

const CACHE_TTL_DAYS = 30

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
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

  const { code, force = false } = parsed.data
  const property = await getPropertyByCode(code)
  if (!property) {
    return NextResponse.json({ error: 'property_not_found' }, { status: 404 })
  }

  if (!force && property.welcome_message && isCacheFresh(property.welcome_generated_at)) {
    return NextResponse.json({ welcome: property.welcome_message, cached: true })
  }

  try {
    const welcome = await generateWelcomeMessage(property)
    await saveWelcomeMessage(property.code, welcome)
    return NextResponse.json({ welcome, cached: false })
  } catch (err) {
    if (err instanceof WelcomeGenerationError) {
      console.error(`[generate-welcome] ${err.name}: ${err.message}`, err.cause)
      return NextResponse.json(
        { error: err.name, message: err.message },
        { status: err.statusCode },
      )
    }
    console.error('[generate-welcome] unknown error', err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}

function isCacheFresh(generatedAt: Date | null): boolean {
  if (!generatedAt) return false
  const ageMs = Date.now() - new Date(generatedAt).getTime()
  const ttlMs = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
  return ageMs < ttlMs
}
