import Image from 'next/image'
import { Clock3, KeyRound, LogIn, LogOut } from 'lucide-react'
import type { Property } from '@/db/schema'
import { QuickStatCard } from '@/components/molecules/QuickStatCard'

const ACCESS_LABELS: Record<string, string> = {
  smart_lock: 'Self check-in',
  keybox: 'Cofre de chaves',
  reception: 'Recepção',
  in_person: 'Em pessoa',
  other: 'Outro acesso',
}

type PropertyHeroProps = {
  property: Property
}

export function PropertyHero({ property }: PropertyHeroProps) {
  const image = property.images[0]
  const access = property.operational.is_self_checkin
    ? 'Self check-in'
    : (ACCESS_LABELS[property.operational.property_access_type] ?? 'Acesso ao imóvel')

  return (
    <section className="space-y-4">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-muted md:aspect-[21/9]">
        {image ? (
          <Image src={image} alt={property.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 1024px" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-5 text-white md:p-8">
          <p className="text-sm font-medium">{property.property_type}</p>
          <h1 className="text-2xl font-semibold md:text-4xl">{property.name}</h1>
          <p className="text-sm text-white/85 md:text-base">
            {property.address.neighborhood}, {property.address.city} — {property.address.state}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <QuickStatCard icon={LogIn} label="Check-in" value={property.rules.check_in_time} />
        <QuickStatCard icon={LogOut} label="Check-out" value={property.rules.check_out_time} />
        <QuickStatCard icon={property.operational.is_self_checkin ? KeyRound : Clock3} label="Acesso" value={access} />
      </div>
    </section>
  )
}
