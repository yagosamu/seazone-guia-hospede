import { MapPin, MessageCircle } from 'lucide-react'
import type { Property } from '@/db/schema'
import { SectionHeader } from '@/components/atoms/SectionHeader'
import { formatAddress, googleMapsUrl, whatsappUrl } from '@/lib/format'

type ContactSectionProps = {
  property: Property
}

export function ContactSection({ property }: ContactSectionProps) {
  const { host, address } = property
  const initials = getInitials(host.name)

  return (
    <section className="space-y-7 pb-12">
      <SectionHeader
        number="04"
        eyebrow="Contato e endereço"
        title="Conte com seu anfitrião"
        description="Qualquer dúvida durante a estadia, fale direto com quem cuida do imóvel."
      />

      <div className="grid gap-8 md:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
              style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
            >
              {initials}
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
                Anfitrião
              </p>
              <p className="text-foreground text-lg font-semibold">{host.name}</p>
              <p className="text-muted-foreground nums-tabular text-sm">{formatPhone(host.phone)}</p>
            </div>
          </div>

          <a
            href={whatsappUrl(host.phone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:brightness-110 active:scale-[0.98]"
            style={{ background: '#FF6B5B', color: '#FAFAF7' }}
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Falar no WhatsApp
          </a>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
            Endereço
          </p>
          <address className="text-foreground space-y-0.5 text-[15px] leading-relaxed not-italic">
            <p className="font-semibold">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ''}
            </p>
            <p className="text-muted-foreground">
              {address.neighborhood} · {address.city} / {address.state}
            </p>
            <p className="text-muted-foreground nums-tabular text-sm">{address.postal_code}</p>
          </address>

          <a
            href={googleMapsUrl(address)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition hover:bg-secondary active:scale-[0.98]"
            style={{ borderColor: 'var(--seazone-blue)', color: 'var(--seazone-blue)' }}
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Ver no Google Maps
          </a>
        </div>
      </div>
    </section>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 13 && digits.startsWith('55')) {
    const ddd = digits.slice(2, 4)
    const first = digits.slice(4, 9)
    const second = digits.slice(9)
    return `+55 (${ddd}) ${first}-${second}`
  }
  return phone
}
