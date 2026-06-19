import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AccessSection } from '@/components/organisms/AccessSection'
import { ContactSection } from '@/components/organisms/ContactSection'
import { PropertyHero } from '@/components/organisms/PropertyHero'
import { PropertyOverview } from '@/components/organisms/PropertyOverview'
import { RulesSection } from '@/components/organisms/RulesSection'
import { getPropertyByCode } from '@/db/queries'

type PageProps = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const property = await getPropertyByCode(code)

  if (!property) return { title: 'Imóvel não encontrado — Seazone' }

  return {
    title: `${property.name} — Guia Seazone`,
    description: `Guia do hóspede para ${property.name} em ${property.address.city}/${property.address.state}.`,
    openGraph: { images: property.images },
  }
}

export default async function PropertyPage({ params }: PageProps) {
  const { code } = await params
  const property = await getPropertyByCode(code)

  if (!property) notFound()

  return (
    <main className="flex flex-col">
      <PropertyHero property={property} />

      <SectionBand tone="paper">
        <PropertyOverview property={property} />
      </SectionBand>

      <SectionBand tone="sky">
        <AccessSection property={property} />
      </SectionBand>

      <SectionBand tone="paper">
        <RulesSection property={property} />
      </SectionBand>

      <SectionBand tone="sky">
        <ContactSection property={property} />
      </SectionBand>
    </main>
  )
}

function SectionBand({
  tone,
  children,
}: {
  tone: 'paper' | 'sky'
  children: React.ReactNode
}) {
  const bg = tone === 'sky' ? 'var(--seazone-sky)' : 'var(--background)'
  return (
    <section className="w-full" style={{ background: bg }}>
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 md:py-20">{children}</div>
    </section>
  )
}
