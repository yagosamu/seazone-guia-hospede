'use client'

import { useMemo } from 'react'
import type { ExperiencesGuide } from '@/db/schemas/experiences'
import { useTranslatedTexts } from '@/lib/i18n/use-translated-content'
import { NeighborhoodSection } from './NeighborhoodSection'

export function TranslatedNeighborhoodSection({ guide, sectionNumber, code }: { guide: ExperiencesGuide; sectionNumber: string; code: string }) {
  const texts = useMemo(() => {
    const arr: string[] = []
    guide.restaurants.forEach((item) => {
      arr.push(item.description)
      arr.push(item.distance)
    })
    guide.attractions.forEach((item) => {
      arr.push(item.description)
      arr.push(item.distance)
    })
    guide.essentials.forEach((item) => {
      arr.push(item.description)
      arr.push(item.distance)
    })
    arr.push(guide.seasonal_tips)
    return arr
  }, [guide])

  const { translated } = useTranslatedTexts(texts)

  const localized = useMemo<ExperiencesGuide>(() => {
    let i = 0
    const restaurants = guide.restaurants.map((item) => {
      const description = translated[i++] ?? item.description
      const distance = translated[i++] ?? item.distance
      return { ...item, description, distance }
    })
    const attractions = guide.attractions.map((item) => {
      const description = translated[i++] ?? item.description
      const distance = translated[i++] ?? item.distance
      return { ...item, description, distance }
    })
    const essentials = guide.essentials.map((item) => {
      const description = translated[i++] ?? item.description
      const distance = translated[i++] ?? item.distance
      return { ...item, description, distance }
    })
    return {
      ...guide,
      restaurants,
      attractions,
      essentials,
      seasonal_tips: translated[i] ?? guide.seasonal_tips,
    }
  }, [guide, translated])

  return <NeighborhoodSection guide={localized} sectionNumber={sectionNumber} code={code} />
}
