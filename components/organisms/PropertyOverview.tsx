'use client'

import { useState } from 'react'
import { Bath, BedDouble, Home, Users } from 'lucide-react'
import type { Property } from '@/db/schema'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { AmenityChip } from '@/components/molecules/AmenityChip'
import { listAvailableAmenities } from '@/lib/amenities'
import { interpolate, useT } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

type PropertyOverviewProps = {
  property: Property
}

const VISIBLE_AMENITIES_ON_MOBILE = 8

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const t = useT()
  const amenities = listAvailableAmenities(property.amenities)
  const bedrooms = pluralize(t.overview.bedrooms, property.bedroom_quantity)
  const bathrooms = pluralize(t.overview.bathrooms, property.bathroom_quantity)
  const guests = pluralize(t.overview.guests, property.guest_capacity)

  return (
    <section className="space-y-7">
      <SectionHeader
        number="01"
        eyebrow={t.overview.eyebrow}
        title={interpolate(t.overview.title, { type: property.property_type, bedrooms, guests })}
      />

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
        <Stat icon={<Home className="h-4 w-4" aria-hidden="true" />}>{property.property_type}</Stat>
        <Dot />
        <Stat icon={<BedDouble className="h-4 w-4" aria-hidden="true" />}>{bedrooms}</Stat>
        <Dot />
        <Stat icon={<Bath className="h-4 w-4" aria-hidden="true" />}>{bathrooms}</Stat>
        <Dot />
        <Stat icon={<Users className="h-4 w-4" aria-hidden="true" />}>{guests}</Stat>
      </div>

      <div className="space-y-3">
        <h3 className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
          {t.overview.amenities}
        </h3>
        <AmenityListWithToggle amenities={amenities} />
      </div>
    </section>
  )
}

function AmenityListWithToggle({ amenities }: { amenities: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const t = useT()
  const hasOverflow = amenities.length > VISIBLE_AMENITIES_ON_MOBILE

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {amenities.map((amenity, i) => (
          <div
            key={amenity}
            className={cn(i >= VISIBLE_AMENITIES_ON_MOBILE && !expanded && 'hidden md:block')}
          >
            <AmenityChip amenityKey={amenity} />
          </div>
        ))}
      </div>
      {hasOverflow ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase transition hover:brightness-110 md:hidden"
          style={{ border: '1px solid var(--seazone-blue)', color: 'var(--seazone-blue)' }}
        >
          {expanded ? t.common.showLess : interpolate(t.common.showAll, { n: amenities.length })}
        </button>
      ) : null}
    </div>
  )
}

function pluralize(labels: { one: string; many: string }, n: number): string {
  return interpolate(n === 1 ? labels.one : labels.many, { n })
}

function Stat({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ color: 'var(--seazone-blue)' }}>{icon}</span>
      {children}
    </span>
  )
}

function Dot() {
  return (
    <span className="text-muted-foreground/40 hidden md:inline" aria-hidden="true">
      ·
    </span>
  )
}
