'use client'

import { WelcomeSection } from './WelcomeSection'
import { useTranslatedTexts } from '@/lib/i18n/use-translated-content'

export function TranslatedWelcomeSection({ message }: { message: string }) {
  const { translated } = useTranslatedTexts([message])
  return <WelcomeSection message={translated[0] ?? message} />
}
