import type { LucideIcon } from 'lucide-react'

type InfoRowProps = {
  icon: LucideIcon
  label: string
  value: string | number
}

export function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
