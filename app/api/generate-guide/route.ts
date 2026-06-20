import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPropertyByCode, saveExperiencesGuide } from '@/db/queries'
import { GenerationError } from '@/lib/experiences/errors'
import { generateExperiencesGuide } from '@/lib/experiences/generate'

export const runtime = 'nodejs'
export const maxDuration = 60

const BodySchema = z.object({
  code: z.string().min(1),
  force: z.boolean().optional(),
})
const CACHE_TTL_DAYS = 30
const ROUTE_TIMEOUT_MS = 60_000

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

  const { code, force = false } = parsed.data
  const property = await getPropertyByCode(code)
  if (!property) {
    return NextResponse.json({ error: 'property_not_found' }, { status: 404 })
  }

  if (!force && property.experiences_guide && isCacheFresh(property.experiences_generated_at)) {
    return NextResponse.json({ guide: property.experiences_guide, cached: true })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ROUTE_TIMEOUT_MS)

  try {
    const guide = await generateExperiencesGuide(property, { signal: controller.signal })
    await saveExperiencesGuide(property.code, guide)

    return NextResponse.json({ guide, cached: false })
  } catch (error) {
    if (controller.signal.aborted) {
      return NextResponse.json(
        { error: 'GenerationTimeoutError', message: 'Tempo máximo de geração excedido' },
        { status: 504 },
      )
    }
    if (error instanceof GenerationError) {
      console.error(`[generate-guide] ${error.name}: ${error.message}`, error.cause)
      return NextResponse.json(
        { error: error.name, message: error.message },
        { status: error.statusCode },
      )
    }

    console.error('[generate-guide] unknown error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  } finally {
    clearTimeout(timeout)
  }
}

function isCacheFresh(generatedAt: Date | null): boolean {
  if (!generatedAt) return false

  const ageMs = Date.now() - generatedAt.getTime()
  const ttlMs = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000

  return ageMs < ttlMs
}
