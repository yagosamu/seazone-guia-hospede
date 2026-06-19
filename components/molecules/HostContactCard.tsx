import { MessageCircle } from 'lucide-react'
import type { Host } from '@/db/schemas/property'
import { whatsappUrl } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type HostContactCardProps = {
  host: Host
}

export function HostContactCard({ host }: HostContactCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Seu anfitrião</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{host.name}</p>
          <p className="text-sm text-muted-foreground">{host.phone}</p>
        </div>
        <Button render={<a href={whatsappUrl(host.phone)} target="_blank" rel="noreferrer" />}>
          <MessageCircle aria-hidden="true" />
          Falar no WhatsApp
        </Button>
      </CardContent>
    </Card>
  )
}
