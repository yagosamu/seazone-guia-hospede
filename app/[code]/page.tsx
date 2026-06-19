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
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:space-y-12 md:py-10">
      <PropertyHero property={property} />
      <PropertyOverview property={property} />
      <AccessSection property={property} />
      <RulesSection property={property} />
      <ContactSection property={property} />
    </main>
  )
}
