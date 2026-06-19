import { CarFront, KeyRound, Wifi } from 'lucide-react'
import type { Property } from '@/db/schema'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { CopyButton } from '@/components/atoms/CopyButton'

const ACCESS_LABELS: Record<string, string> = {
  smart_lock: 'Fechadura digital',
  keybox: 'Cofre de chaves',
  reception: 'Recepção 24h',
  in_person: 'Entrega presencial',
  other: 'Outro tipo de acesso',
}

type AccessSectionProps = {
  property: Property
}

export function AccessSection({ property }: AccessSectionProps) {
  const { operational } = property
  const accessLabel = ACCESS_LABELS[operational.property_access_type] ?? 'Acesso ao imóvel'
  const hasParking = operational.has_parking_spot

  return (
    <section className="space-y-7">
      <SectionHeader
        number="02"
        eyebrow="Conexão e acesso"
        title="Tudo o que você precisa para chegar"
      />

      <div
        className={`grid gap-5 md:gap-6 ${
          hasParking ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'
        }`}
      >
        <AccessItem icon={<KeyRound className="h-4 w-4" aria-hidden="true" />} label="Entrada">
          <p className="text-foreground text-[15px] leading-relaxed">
            <span className="font-semibold">{accessLabel}</span>
            {operational.property_password ? (
              <>
                {' · '}código{' '}
                <code
                  className="bg-card rounded px-2 py-0.5 font-mono text-[13px] font-medium"
                  style={{ color: 'var(--seazone-blue)' }}
                >
                  {operational.property_password}
                </code>
              </>
            ) : null}
          </p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            {operational.property_access_instructions}
          </p>
        </AccessItem>

        {hasParking ? (
          <AccessItem
            icon={<CarFront className="h-4 w-4" aria-hidden="true" />}
            label="Estacionamento"
          >
            {operational.parking_spot_identifier ? (
              <p className="text-foreground text-[15px] leading-relaxed font-semibold">
                {operational.parking_spot_identifier}
              </p>
            ) : null}
            {operational.parking_spot_instructions ? (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {operational.parking_spot_instructions}
              </p>
            ) : null}
          </AccessItem>
        ) : null}

        <WifiItem network={operational.wifi_network} password={operational.wifi_password} />
      </div>
    </section>
  )
}

function AccessItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col space-y-2 py-1">
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--seazone-blue)' }}>{icon}</span>
        <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
          {label}
        </span>
      </div>
      <div>{children}</div>
    </div>
  )
}

function WifiItem({ network, password }: { network: string; password: string }) {
  return (
    <div
      className="relative flex h-full flex-col space-y-2 overflow-hidden rounded-2xl px-5 py-5"
      style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
    >
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-25"
        style={{ background: '#FF6B5B' }}
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-2">
        <Wifi className="h-4 w-4" style={{ color: '#FF6B5B' }} aria-hidden="true" />
        <span
          className="text-[10px] font-semibold tracking-[0.2em] uppercase"
          style={{ color: '#FF6B5B' }}
        >
          WiFi
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[15px] leading-relaxed">
            <span className="font-semibold">Rede</span>
            <span className="mx-2 opacity-50">·</span>
            <span className="font-mono text-sm font-medium break-all">{network}</span>
          </p>
          <p className="text-[15px] leading-relaxed">
            <span className="font-semibold">Senha</span>
            <span className="mx-2 opacity-50">·</span>
            <span className="font-mono text-sm font-medium break-all">{password}</span>
          </p>
        </div>

        <div className="pt-1">
          <CopyButton value={password} variant="coral" />
        </div>
      </div>
    </div>
  )
}
