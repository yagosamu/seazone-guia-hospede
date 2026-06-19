import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type QuickStatCardProps = {
  icon: LucideIcon
  label: string
  value: string
}

export function QuickStatCard({ icon: Icon, label, value }: QuickStatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
