import { NextResponse } from 'next/server'
import { getPropertyByCode } from '@/db/queries'
import { ItineraryError } from '@/lib/itinerary/errors'
import { refineItinerary } from '@/lib/itinerary/refine'
import { RefineRequestSchema } from '@/lib/itinerary/refine-schema'
export const runtime = 'nodejs'; export const maxDuration = 45
export async function POST(request: Request) { let body: unknown; try { body = await request.json() } catch { return NextResponse.json({ error: 'invalid_body' }, { status: 400 }) }; const parsed = RefineRequestSchema.safeParse(body); if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 }); if (parsed.data.history.length >= 10) return NextResponse.json({ error: 'refinement_limit_reached' }, { status: 429 }); const property = await getPropertyByCode(parsed.data.code); if (!property) return NextResponse.json({ error: 'property_not_found' }, { status: 404 }); try { return NextResponse.json({ itinerary: await refineItinerary({ property, ...parsed.data }) }) } catch (e) { if (e instanceof ItineraryError) return NextResponse.json({ error: e.name, message: e.message }, { status: e.statusCode }); return NextResponse.json({ error: 'internal_error' }, { status: 500 }) } }
