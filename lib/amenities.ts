import {
  ArrowUpDown,
  Bath,
  Bed,
  Check,
  ChefHat,
  Droplets,
  Dumbbell,
  Flame,
  MapPin,
  Microwave,
  Mountain,
  PanelTop,
  PawPrint,
  Plane,
  Refrigerator,
  ShieldCheck,
  ShowerHead,
  Snowflake,
  Sun,
  ThermometerSun,
  Tv,
  Umbrella,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

type AmenityDefinition = { label: string; icon: LucideIcon }

// A ordem das keys define a ordem de exibição. Mantenha agrupada por categoria.
export const AMENITY_MAP: Record<string, AmenityDefinition> = {
  // Localização e diferenciais
  excellent_location: { label: 'Localização excelente', icon: MapPin },
  beachfront: { label: 'Pé na areia', icon: Umbrella },
  near_beach: { label: 'Próximo à praia', icon: Waves },
  sea_view: { label: 'Vista para o mar', icon: Waves },
  mountain_view: { label: 'Vista para a montanha', icon: Mountain },

  // Acesso e serviços
  airport_pickup: { label: 'Pick-up do aeroporto', icon: Plane },
  pets_allowed: { label: 'Pets permitidos', icon: PawPrint },
  doorman_24h: { label: 'Portaria 24h', icon: ShieldCheck },
  elevator: { label: 'Elevador', icon: ArrowUpDown },

  // Conforto principal
  wifi: { label: 'WiFi', icon: Wifi },
  tv: { label: 'TV', icon: Tv },
  air_conditioning: { label: 'Ar-condicionado', icon: Snowflake },
  heater: { label: 'Aquecedor', icon: ThermometerSun },
  hot_water: { label: 'Água quente', icon: Sun },
  fireplace: { label: 'Lareira', icon: Flame },

  // Cozinha
  full_kitchen: { label: 'Cozinha completa', icon: ChefHat },
  kitchen: { label: 'Cozinha equipada', icon: ChefHat },
  fridge: { label: 'Geladeira', icon: Refrigerator },
  microwave: { label: 'Microondas', icon: Microwave },
  dishwasher: { label: 'Lava-louças', icon: UtensilsCrossed },
  bbq_grill: { label: 'Churrasqueira', icon: Flame },

  // Roupa e higiene
  washing_machine: { label: 'Máquina de lavar', icon: WashingMachine },
  bed_linen: { label: 'Roupa de cama', icon: Bed },
  towels: { label: 'Toalhas', icon: Bath },
  hygiene_kit: { label: 'Kit de higiene', icon: Droplets },
  shower: { label: 'Chuveiro quente', icon: ShowerHead },

  // Lazer e área externa
  pool: { label: 'Piscina', icon: Waves },
  gym: { label: 'Academia', icon: Dumbbell },
  balcony: { label: 'Varanda', icon: PanelTop },
}

export function getAmenity(key: string): AmenityDefinition {
  return AMENITY_MAP[key] ?? { label: key.replace(/_/g, ' '), icon: Check }
}

/**
 * Lista as keys de amenities disponíveis no imóvel, ordenadas pela ordem definida
 * em AMENITY_MAP. Keys desconhecidas vão pro final, em ordem alfabética.
 */
export function listAvailableAmenities(amenities: Record<string, boolean>): string[] {
  const knownInOrder = Object.keys(AMENITY_MAP).filter((key) => amenities[key] === true)
  const knownSet = new Set(knownInOrder)
  const unknown = Object.keys(amenities)
    .filter((key) => amenities[key] === true && !knownSet.has(key) && AMENITY_MAP[key] === undefined)
    .sort()
  return [...knownInOrder, ...unknown]
}
