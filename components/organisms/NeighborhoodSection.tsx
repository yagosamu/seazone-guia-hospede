'use client'

import { useState, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import { interpolate, useT } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'
import type { Attraction, Essential, ExperiencesGuide, Restaurant } from '@/db/schemas/experiences'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { PlaceTypeBadge } from '@/components/atoms/PlaceTypeBadge'
import { PlaceCard } from '@/components/molecules/PlaceCard'
import { ItineraryTrigger } from './ItineraryTrigger'

type NeighborhoodSectionProps = {
  guide: ExperiencesGuide
  sectionNumber: string
  code: string
}

const VISIBLE_ON_MOBILE = 2

export function NeighborhoodSection({ guide, sectionNumber, code }: NeighborhoodSectionProps) {
  const t = useT()

  return (
    <section className="space-y-10">
      <SectionHeader
        number={sectionNumber}
        eyebrow={t.neighborhood.eyebrow}
        title={t.neighborhood.title}
        description={t.neighborhood.description}
      />

      <SubSection
        title={t.neighborhood.restaurants}
        subtitle={interpolate(t.neighborhood.selected, { n: guide.restaurants.length })}
      >
        <CardListWithToggle
          items={guide.restaurants}
          gridClass="grid gap-4 md:grid-cols-2 lg:grid-cols-2"
          renderCard={(r, idx) => (
            <PlaceCard
              index={idx + 1}
              name={r.name}
              distance={r.distance}
              description={r.description}
            />
          )}
        />
      </SubSection>

      <SubSection
        title={t.neighborhood.attractions}
        subtitle={interpolate(t.neighborhood.points, { n: guide.attractions.length })}
      >
        <CardListWithToggle
          items={guide.attractions}
          gridClass="grid gap-4 md:grid-cols-2"
          renderCard={(a, idx) => (
            <PlaceCard
              index={idx + 1}
              name={a.name}
              distance={a.distance}
              description={a.description}
            />
          )}
        />
      </SubSection>

      <SubSection title={t.neighborhood.essentials} subtitle={t.neighborhood.essentialSubtitle}>
        <CardListWithToggle
          items={guide.essentials}
          gridClass="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          renderCard={(e, idx) => (
            <PlaceCard
              index={idx + 1}
              name={e.name}
              distance={e.distance}
              description={e.description}
              badge={<PlaceTypeBadge type={e.type} />}
            />
          )}
        />
      </SubSection>

      <aside
        className="relative overflow-hidden rounded-2xl p-6 md:p-8"
        style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
      >
        <div
          className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20"
          style={{ background: '#FF6B5B' }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-start md:gap-5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,107,91,0.18)' }}
          >
            <Sparkles className="h-5 w-5" style={{ color: '#FF6B5B' }} aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <p
              className="text-[10px] font-bold tracking-[0.22em] uppercase"
              style={{ color: '#FF6B5B' }}
            >
              {t.neighborhood.seasonalTip}
            </p>
            <p className="text-[15px] leading-relaxed md:text-base">{guide.seasonal_tips}</p>
          </div>
        </div>
      </aside>

      <div className="flex justify-center pt-1">
        <ItineraryTrigger code={code} />
      </div>
    </section>
  )
}

function SubSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-foreground text-lg font-bold tracking-tight md:text-xl">{title}</h3>
        <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
          {subtitle}
        </span>
      </div>
      {children}
    </div>
  )
}

type ItemBase = Restaurant | Attraction | Essential

function CardListWithToggle<T extends ItemBase>({
  items,
  gridClass,
  renderCard,
}: {
  items: T[]
  gridClass: string
  renderCard: (item: T, idx: number) => ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const t = useT()
  const hasOverflow = items.length > VISIBLE_ON_MOBILE

  return (
    <div className="space-y-3">
      <div className={gridClass}>
        {items.map((item, i) => (
          <div
            key={item.name}
            className={cn(i >= VISIBLE_ON_MOBILE && !expanded && 'hidden md:block')}
          >
            {renderCard(item, i)}
          </div>
        ))}
      </div>
      {hasOverflow ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mx-auto mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase transition hover:brightness-110 md:hidden"
          style={{ border: '1px solid var(--seazone-blue)', color: 'var(--seazone-blue)' }}
        >
          {expanded
            ? t.common.showLess
            : interpolate(t.common.showMore, { n: items.length - VISIBLE_ON_MOBILE })}
        </button>
      ) : null}
    </div>
  )
}
