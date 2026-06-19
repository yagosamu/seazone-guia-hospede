import { Bath, BedDouble, Home, Users } from 'lucide-react'
import type { Property } from '@/db/schema'
import { InfoRow } from '@/components/atoms/InfoRow'
import { AmenityChip } from '@/components/molecules/AmenityChip'

type PropertyOverviewProps = {
  property: Property
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const amenities = Object.entries(property.amenities)
    .filter(([, available]) => available)
    .map(([key]) => key)

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold md:text-2xl">Sobre o imóvel</h2>
        <p className="mt-1 text-muted-foreground">Tudo o que você precisa para uma estadia confortável.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoRow icon={Home} label="Tipo" value={property.property_type} />
        <InfoRow icon={BedDouble} label="Quartos" value={property.bedroom_quantity} />
        <InfoRow icon={Bath} label="Banheiros" value={property.bathroom_quantity} />
        <InfoRow icon={Users} label="Hóspedes" value={property.guest_capacity} />
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">Amenidades</h3>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => <AmenityChip key={amenity} amenityKey={amenity} />)}
        </div>
      </div>
    </section>
  )
}
