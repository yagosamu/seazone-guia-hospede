import { getAmenity } from '@/lib/amenities'

type AmenityChipProps = {
  amenityKey: string
}

export function AmenityChip({ amenityKey }: AmenityChipProps) {
  const { icon: Icon, label } = getAmenity(amenityKey)

  return (
    <span
      className="border-border text-foreground/85 inline-flex items-center gap-1.5 rounded-full border bg-transparent px-3 py-1.5 text-xs font-medium"
    >
      <Icon className="h-3.5 w-3.5" style={{ color: 'var(--seazone-blue)' }} aria-hidden="true" />
      {label}
    </span>
  )
}
