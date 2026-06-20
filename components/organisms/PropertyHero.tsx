import Image from 'next/image'
import type { Property } from '@/db/schema'

const ACCESS_LABELS: Record<string, string> = {
  smart_lock: 'Self check-in',
  keybox: 'Cofre de chaves',
  reception: 'Recepção',
  in_person: 'Em pessoa',
  other: 'Outro acesso',
}

type PropertyHeroProps = {
  property: Property
  welcomeMessage?: string | null
}

export function PropertyHero({ property, welcomeMessage }: PropertyHeroProps) {
  const image = property.images[0]
  const access = property.operational.is_self_checkin
    ? 'Self check-in'
    : (ACCESS_LABELS[property.operational.property_access_type] ?? 'Acesso ao imóvel')

  return (
    <section className="relative w-full">
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[72vh] md:min-h-[520px]">
        {image ? (
          <Image
            src={image}
            alt={property.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : null}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 75% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15,76,129,0.05) 0%, rgba(15,76,129,0.02) 30%, rgba(15,76,129,0.78) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-6 pb-10 md:px-10 md:pb-16">
            <div className="max-w-3xl text-[#FAFAF7]">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="text-sm font-semibold tracking-[0.16em] uppercase md:text-base"
                  style={{ color: '#FF6B5B' }}
                >
                  Bem-vindo a
                </span>
                <span className="h-px w-10" style={{ background: '#FF6B5B' }} aria-hidden="true" />
                <span className="text-sm font-medium tracking-[0.1em] uppercase opacity-80 md:text-base">
                  {property.property_type}
                </span>
              </div>
              <h1 className="text-3xl leading-[1.1] font-bold tracking-tight md:text-5xl lg:text-6xl">
                {property.name}
              </h1>
              <div
                className="mt-5 mb-4 h-[2px] w-12"
                style={{ background: '#FF6B5B' }}
                aria-hidden="true"
              />
              <p className="text-sm md:text-base">
                <span className="opacity-90">{property.address.neighborhood}</span>
                <span className="mx-2 opacity-50">·</span>
                <span className="opacity-90">{property.address.city}</span>
                <span className="mx-2 opacity-50">·</span>
                <span className="opacity-90">{property.address.state}</span>
              </p>
              {welcomeMessage ? (
                <p className="mt-6 max-w-2xl text-sm leading-relaxed opacity-95 md:text-base md:leading-[1.7]">
                  {welcomeMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="border-border bg-background border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 px-6 md:grid-cols-3 md:px-10">
          <HeroStat label="Check-in" value={property.rules.check_in_time} />
          <HeroStat label="Check-out" value={property.rules.check_out_time} divider />
          <HeroStat label="Acesso" value={access} divider />
        </div>
      </div>
    </section>
  )
}

function HeroStat({
  label,
  value,
  divider = false,
}: {
  label: string
  value: string
  divider?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-1 py-6 md:py-7 ${
        divider ? 'border-border border-t md:border-t-0 md:border-l md:pl-8' : ''
      } md:pr-8`}
    >
      <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
        {label}
      </span>
      <span
        className="nums-tabular text-2xl leading-tight font-bold tracking-tight md:text-3xl"
        style={{ color: 'var(--seazone-blue)' }}
      >
        {value}
      </span>
    </div>
  )
}
