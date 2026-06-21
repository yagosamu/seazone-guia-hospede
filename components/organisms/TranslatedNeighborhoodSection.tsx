'use client'

import { useMemo } from 'react'
import type { ExperiencesGuide } from '@/db/schemas/experiences'
import { useTranslatedTexts } from '@/lib/i18n/use-translated-content'
import { NeighborhoodSection } from './NeighborhoodSection'

export function TranslatedNeighborhoodSection({ guide, sectionNumber }: { guide: ExperiencesGuide; sectionNumber: string }) {
  const texts = useMemo(() => [...guide.restaurants.map((item) => item.description), ...guide.attractions.map((item) => item.description), ...guide.essentials.map((item) => item.description), guide.seasonal_tips], [guide])
  const { translated } = useTranslatedTexts(texts)
  const localized = useMemo<ExperiencesGuide>(() => {
    let index = 0
    return {
      ...guide,
      restaurants: guide.restaurants.map((item) => ({ ...item, description: translated[index++] ?? item.description })),
      attractions: guide.attractions.map((item) => ({ ...item, description: translated[index++] ?? item.description })),
      essentials: guide.essentials.map((item) => ({ ...item, description: translated[index++] ?? item.description })),
      seasonal_tips: translated[index] ?? guide.seasonal_tips,
    }
  }, [guide, translated])
  return <NeighborhoodSection guide={localized} sectionNumber={sectionNumber} />
}
