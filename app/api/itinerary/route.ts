import { NextResponse } from 'next/server'
import { getPropertyByCode } from '@/db/queries'
import { ItineraryError } from '@/lib/itinerary/errors'
import { generateItinerary } from '@/lib/itinerary/generate'
import { ItineraryRequestSchema } from '@/lib/itinerary/schema'

export const runtime = 'nodejs'
export const maxDuration = 45

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }) }
  const parsed = ItineraryRequestSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', details: parsed.error.issues }, { status: 400 })
  const { code, locale, ...itineraryRequest } = parsed.data
  const property = await getPropertyByCode(code)
  if (!property) return NextResponse.json({ error: 'property_not_found' }, { status: 404 })
  try {
    return NextResponse.json({ itinerary: await generateItinerary(property, itineraryRequest, locale) })
  } catch (error) {
    if (error instanceof ItineraryError) return NextResponse.json({ error: error.name, message: error.message }, { status: error.statusCode })
    console.error('[itinerary] unknown error', error)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
