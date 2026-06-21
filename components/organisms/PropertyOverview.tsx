'use client'

import { Bath, BedDouble, Home, Users } from 'lucide-react'
import type { Property } from '@/db/schema'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { AmenityChip } from '@/components/molecules/AmenityChip'
import { listAvailableAmenities } from '@/lib/amenities'
import { interpolate, useT } from '@/lib/i18n/provider'

type PropertyOverviewProps = {
  property: Property
}

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
        <Stat icon={<Home className="h-4 w-4" aria-hidden="true" />}>
          {property.property_type}
        </Stat>
        <Dot />
        <Stat icon={<BedDouble className="h-4 w-4" aria-hidden="true" />}>
          {bedrooms}
        </Stat>
        <Dot />
        <Stat icon={<Bath className="h-4 w-4" aria-hidden="true" />}>
          {bathrooms}
        </Stat>
        <Dot />
        <Stat icon={<Users className="h-4 w-4" aria-hidden="true" />}>
          {guests}
        </Stat>
      </div>

      <div className="space-y-3">
        <h3 className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
          {t.overview.amenities}
        </h3>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => (
            <AmenityChip key={amenity} amenityKey={amenity} />
          ))}
        </div>
      </div>
    </section>
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
