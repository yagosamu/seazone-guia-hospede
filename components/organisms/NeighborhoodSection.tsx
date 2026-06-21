'use client'

import { Sparkles } from 'lucide-react'
import { interpolate, useT } from '@/lib/i18n/provider'
import type { ExperiencesGuide } from '@/db/schemas/experiences'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { PlaceTypeBadge } from '@/components/atoms/PlaceTypeBadge'
import { PlaceCard } from '@/components/molecules/PlaceCard'

type NeighborhoodSectionProps = {
  guide: ExperiencesGuide
  sectionNumber: string
}

export function NeighborhoodSection({ guide, sectionNumber }: NeighborhoodSectionProps) {
  const t = useT()
  return (
    <section className="space-y-10">
      <SectionHeader
        number={sectionNumber}
        eyebrow={t.neighborhood.eyebrow}
        title={t.neighborhood.title}
        description={t.neighborhood.description}
      />

      <SubSection title={t.neighborhood.restaurants} subtitle={interpolate(t.neighborhood.selected, { n: guide.restaurants.length })}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {guide.restaurants.map((r, idx) => (
            <PlaceCard
              key={r.name}
              index={idx + 1}
              name={r.name}
              distance={r.distance}
              description={r.description}
            />
          ))}
        </div>
      </SubSection>

      <SubSection title={t.neighborhood.attractions} subtitle={interpolate(t.neighborhood.points, { n: guide.attractions.length })}>
        <div className="grid gap-4 md:grid-cols-2">
          {guide.attractions.map((a, idx) => (
            <PlaceCard
              key={a.name}
              index={idx + 1}
              name={a.name}
              distance={a.distance}
              description={a.description}
            />
          ))}
        </div>
      </SubSection>

      <SubSection title={t.neighborhood.essentials} subtitle={t.neighborhood.essentialSubtitle}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {guide.essentials.map((e, idx) => (
            <PlaceCard
              key={e.name}
              index={idx + 1}
              name={e.name}
              distance={e.distance}
              description={e.description}
              badge={<PlaceTypeBadge type={e.type} />}
            />
          ))}
        </div>
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
  children: React.ReactNode
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
