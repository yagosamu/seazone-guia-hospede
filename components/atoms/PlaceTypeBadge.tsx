'use client'

import { Banknote, Cross, Fuel, HeartPulse, ShoppingBasket, MapPin } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'
import type { Essential } from '@/db/schemas/experiences'

type EssentialType = Essential['type']

const TYPE_CONFIG: Record<EssentialType, { label: string; icon: typeof Cross }> = {
  pharmacy: { label: 'Farmácia', icon: Cross },
  market: { label: 'Mercado', icon: ShoppingBasket },
  hospital: { label: 'Hospital', icon: HeartPulse },
  gas_station: { label: 'Posto', icon: Fuel },
  bank: { label: 'Banco', icon: Banknote },
  other: { label: 'Outros', icon: MapPin },
}

export function PlaceTypeBadge({ type }: { type: EssentialType }) {
  const t = useT()
  const { icon: Icon } = TYPE_CONFIG[type]
  const label = t.placeTypes[type] ?? type
  return (
    <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase">
      <Icon className="h-3 w-3" style={{ color: 'var(--seazone-blue)' }} aria-hidden="true" />
      {label}
    </span>
  )
}
