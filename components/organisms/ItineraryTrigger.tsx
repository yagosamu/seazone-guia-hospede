'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import { ItineraryModal } from './ItineraryModal'

export function ItineraryTrigger({ code }: { code: string }) {
  const [open, setOpen] = useState(false)
  const t = useT()
  return <><button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:brightness-110 active:scale-[.98]" style={{ background: '#FF6B5B', color: '#FAFAF7' }}><Sparkles className="h-4 w-4" aria-hidden="true" />{t.itinerary.cta}</button>{open ? <ItineraryModal code={code} onClose={() => setOpen(false)} /> : null}</>
}
