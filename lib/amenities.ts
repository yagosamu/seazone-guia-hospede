import {
  ArrowUpDown,
  Check,
  ChefHat,
  Dumbbell,
  Flame,
  PanelTop,
  ShieldCheck,
  Snowflake,
  Tv,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

type AmenityDefinition = { label: string; icon: LucideIcon }

export const AMENITY_MAP: Record<string, AmenityDefinition> = {
  wifi: { label: 'WiFi', icon: Wifi },
  tv: { label: 'TV', icon: Tv },
  air_conditioning: { label: 'Ar-condicionado', icon: Snowflake },
  kitchen: { label: 'Cozinha equipada', icon: ChefHat },
  washing_machine: { label: 'Máquina de lavar', icon: WashingMachine },
  elevator: { label: 'Elevador', icon: ArrowUpDown },
  balcony: { label: 'Varanda', icon: PanelTop },
  pool: { label: 'Piscina', icon: Waves },
  gym: { label: 'Academia', icon: Dumbbell },
  sea_view: { label: 'Vista para o mar', icon: Waves },
  doorman_24h: { label: 'Portaria 24h', icon: ShieldCheck },
  bbq_grill: { label: 'Churrasqueira', icon: Flame },
  dishwasher: { label: 'Lava-louças', icon: UtensilsCrossed },
}

export function getAmenity(key: string): AmenityDefinition {
  return AMENITY_MAP[key] ?? { label: key.replace(/_/g, ' '), icon: Check }
}
