import { CarFront, KeyRound, Wifi } from 'lucide-react'
import type { Property } from '@/db/schema'
import { CopyButton } from '@/components/atoms/CopyButton'
import { AccessInfoBlock } from '@/components/molecules/AccessInfoBlock'

const ACCESS_LABELS: Record<string, string> = {
  smart_lock: 'Fechadura digital',
  keybox: 'Cofre de chaves',
  reception: 'Recepção',
  in_person: 'Entrega presencial',
  other: 'Outro',
}

type AccessSectionProps = {
  property: Property
}

export function AccessSection({ property }: AccessSectionProps) {
  const { operational } = property

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold md:text-2xl">Acesso ao imóvel</h2>
        <p className="mt-1 text-muted-foreground">Informações para sua chegada e estadia.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <AccessInfoBlock icon={Wifi} title="WiFi">
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted-foreground">Rede</dt><dd className="font-medium">{operational.wifi_network}</dd></div>
            <div className="flex items-end justify-between gap-3"><div><dt className="text-muted-foreground">Senha</dt><dd className="font-medium">{operational.wifi_password}</dd></div><CopyButton value={operational.wifi_password} /></div>
          </dl>
        </AccessInfoBlock>
        <AccessInfoBlock icon={KeyRound} title="Acesso ao imóvel">
          <div className="space-y-2 text-sm"><p className="font-medium">{ACCESS_LABELS[operational.property_access_type] ?? 'Acesso ao imóvel'}</p><p className="text-muted-foreground">{operational.property_access_instructions}</p>{operational.property_password ? <p><span className="text-muted-foreground">Código: </span><span className="font-medium">{operational.property_password}</span></p> : null}</div>
        </AccessInfoBlock>
        {operational.has_parking_spot ? (
          <AccessInfoBlock icon={CarFront} title="Estacionamento">
            <div className="space-y-2 text-sm">{operational.parking_spot_identifier ? <p className="font-medium">{operational.parking_spot_identifier}</p> : null}{operational.parking_spot_instructions ? <p className="text-muted-foreground">{operational.parking_spot_instructions}</p> : null}</div>
          </AccessInfoBlock>
        ) : null}
      </div>
    </section>
  )
}
