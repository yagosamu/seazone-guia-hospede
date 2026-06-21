'use client'

import { Clock, Coffee, MapPin, Moon, Sun } from 'lucide-react'
import type { Day, Period } from '@/lib/itinerary/types'
import { interpolate, useT } from '@/lib/i18n/provider'

const ICONS: Record<Period, typeof Sun> = { morning: Sun, afternoon: Coffee, evening: Moon }

export function ItineraryDayCard({ day }: { day: Day }) {
  const t = useT()
  return <article className="border-border bg-card rounded-2xl border p-5">
    <header className="mb-4"><p className="text-[10px] font-bold tracking-[.2em] uppercase" style={{ color: '#FF6B5B' }}>{interpolate(t.itinerary.result.dayLabel, { n: day.day_number })}</p><h3 className="text-foreground mt-1 text-lg font-bold">{day.title}</h3></header>
    <div className="space-y-4">{day.activities.map((activity, index) => { const Icon = ICONS[activity.period]; return <div key={`${activity.period}-${index}`} className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--seazone-blue)' }} aria-hidden="true" /><div><p className="text-muted-foreground text-[10px] font-semibold tracking-[.16em] uppercase">{t.itinerary.result.periods[activity.period]}</p><p className="text-foreground text-sm font-semibold">{activity.title} {activity.from_guide ? <span className="ml-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ background: 'rgba(255,107,91,.12)', color: '#FF6B5B' }}>{t.itinerary.result.fromGuide}</span> : null}</p><p className="text-muted-foreground mt-1 text-sm leading-relaxed">{activity.description}</p></div></div> })}</div>
  </article>
}
