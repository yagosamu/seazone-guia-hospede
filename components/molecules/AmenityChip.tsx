import { Badge } from '@/components/ui/badge'
import { getAmenity } from '@/lib/amenities'

type AmenityChipProps = {
  amenityKey: string
}

export function AmenityChip({ amenityKey }: AmenityChipProps) {
  const { icon: Icon, label } = getAmenity(amenityKey)

  return (
    <Badge variant="secondary" className="h-7 gap-1.5 px-2.5">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </Badge>
  )
}
