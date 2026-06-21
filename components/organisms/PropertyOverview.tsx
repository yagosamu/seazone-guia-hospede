import { Bath, BedDouble, Home, Users } from 'lucide-react'
import type { Property } from '@/db/schema'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { AmenityChip } from '@/components/molecules/AmenityChip'
import { listAvailableAmenities } from '@/lib/amenities'

type PropertyOverviewProps = {
  property: Property
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const amenities = listAvailableAmenities(property.amenities)

  return (
    <section className="space-y-7">
      <SectionHeader
        number="01"
        eyebrow="Sobre o imóvel"
        title={`${property.property_type} de ${property.bedroom_quantity} ${
          property.bedroom_quantity === 1 ? 'quarto' : 'quartos'
        } para até ${property.guest_capacity} ${
          property.guest_capacity === 1 ? 'hóspede' : 'hóspedes'
        }`}
      />

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
        <Stat icon={<Home className="h-4 w-4" aria-hidden="true" />}>
          {property.property_type}
        </Stat>
        <Dot />
        <Stat icon={<BedDouble className="h-4 w-4" aria-hidden="true" />}>
          {property.bedroom_quantity} {property.bedroom_quantity === 1 ? 'quarto' : 'quartos'}
        </Stat>
        <Dot />
        <Stat icon={<Bath className="h-4 w-4" aria-hidden="true" />}>
          {property.bathroom_quantity}{' '}
          {property.bathroom_quantity === 1 ? 'banheiro' : 'banheiros'}
        </Stat>
        <Dot />
        <Stat icon={<Users className="h-4 w-4" aria-hidden="true" />}>
          até {property.guest_capacity}{' '}
          {property.guest_capacity === 1 ? 'hóspede' : 'hóspedes'}
        </Stat>
      </div>

      <div className="space-y-3">
        <h3 className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
          Comodidades
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
