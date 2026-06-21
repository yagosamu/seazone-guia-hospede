import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AccessSection } from '@/components/organisms/AccessSection'
import { ChatWidget } from '@/components/organisms/ChatWidget'
import { ContactSection } from '@/components/organisms/ContactSection'
import { NeighborhoodLoader } from '@/components/organisms/NeighborhoodLoader'
import { NeighborhoodSection } from '@/components/organisms/NeighborhoodSection'
import { PropertyHero } from '@/components/organisms/PropertyHero'
import { PropertyOverview } from '@/components/organisms/PropertyOverview'
import { RulesSection } from '@/components/organisms/RulesSection'
import { WelcomeLoader } from '@/components/organisms/WelcomeLoader'
import { WelcomeSection } from '@/components/organisms/WelcomeSection'
import { getPropertyByCode } from '@/db/queries'

type PageProps = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params
  const property = await getPropertyByCode(code)

  if (!property) return { title: 'Imóvel não encontrado · Seazone' }

  return {
    title: `${property.name} · Guia Seazone`,
    description: `Guia do hóspede para ${property.name} em ${property.address.city}/${property.address.state}.`,
    openGraph: { images: property.images },
  }
}

export default async function PropertyPage({ params }: PageProps) {
  const { code } = await params
  const property = await getPropertyByCode(code)

  if (!property) notFound()

  const guide = property.experiences_guide ?? null
  const welcome = property.welcome_message ?? null

  return (
    <main className="flex flex-col">
      <PropertyHero property={property} />

      <SectionBand tone="paper">
        {welcome ? (
          <WelcomeSection message={welcome} />
        ) : (
          <WelcomeLoader code={property.code} />
        )}
      </SectionBand>

      <SectionBand tone="sky">
        <PropertyOverview property={property} />
      </SectionBand>

      <SectionBand tone="paper">
        <AccessSection property={property} />
      </SectionBand>

      <SectionBand tone="sky">
        <RulesSection property={property} />
      </SectionBand>

      <SectionBand tone="paper">
        {guide ? (
          <NeighborhoodSection guide={guide} sectionNumber="04" />
        ) : (
          <NeighborhoodLoader code={property.code} sectionNumber="04" />
        )}
      </SectionBand>

      <SectionBand tone="sky">
        <ContactSection property={property} sectionNumber="05" />
      </SectionBand>

      <ChatWidget
        code={property.code}
        propertyName={property.name}
        hostFirstName={property.host.name.split(' ')[0] ?? property.host.name}
      />
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
