import { MapPinned } from 'lucide-react'
import type { Property } from '@/db/schema'
import { HostContactCard } from '@/components/molecules/HostContactCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAddress, googleMapsUrl } from '@/lib/format'

type ContactSectionProps = {
  property: Property
}

export function ContactSection({ property }: ContactSectionProps) {
  return (
    <section className="space-y-5 pb-4">
      <div>
        <h2 className="text-xl font-semibold md:text-2xl">Contato e endereço</h2>
        <p className="mt-1 text-muted-foreground">Conte com seu anfitrião durante a estadia.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <HostContactCard host={property.host} />
        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-3"><p className="text-sm text-muted-foreground">{formatAddress(property.address)}</p><Button variant="outline" render={<a href={googleMapsUrl(property.address)} target="_blank" rel="noreferrer" />}><MapPinned aria-hidden="true" />Ver no Google Maps</Button></CardContent>
        </Card>
      </div>
    </section>
  )
}
