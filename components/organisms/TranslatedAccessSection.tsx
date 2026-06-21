'use client'

import { useMemo } from 'react'
import type { Property } from '@/db/schema'
import { useTranslatedTexts } from '@/lib/i18n/use-translated-content'
import { AccessSection } from './AccessSection'

/**
 * Traduz on-demand os campos textuais do operational (instruções de acesso, vaga e estacionamento).
 * WiFi network/password, código numérico e tipo de acesso (já vem do dicionário) continuam intactos.
 */
export function TranslatedAccessSection({ property }: { property: Property }) {
  const { operational } = property

  // Constrói array de strings preservando posição (null/empty → string vazia, ignorada visualmente).
  const texts = useMemo(
    () => [
      operational.property_access_instructions ?? '',
      operational.parking_spot_identifier ?? '',
      operational.parking_spot_instructions ?? '',
    ],
    [operational],
  )

  const { translated } = useTranslatedTexts(texts)

  const localizedProperty = useMemo<Property>(() => {
    const [accessInstr, parkingId, parkingInstr] = translated
    return {
      ...property,
      operational: {
        ...operational,
        property_access_instructions:
          operational.property_access_instructions && accessInstr
            ? accessInstr
            : operational.property_access_instructions,
        parking_spot_identifier:
          operational.parking_spot_identifier && parkingId
            ? parkingId
            : operational.parking_spot_identifier,
        parking_spot_instructions:
          operational.parking_spot_instructions && parkingInstr
            ? parkingInstr
            : operational.parking_spot_instructions,
      },
    }
  }, [property, operational, translated])

  return <AccessSection property={localizedProperty} />
}
