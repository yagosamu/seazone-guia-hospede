'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getDictionary } from './dictionaries'
import type { Locale } from './types'

type I18nValue = { locale: Locale; setLocale: (locale: Locale) => void; t: Record<string, any> }
const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState(initialLocale)
  const router = useRouter()
  const value = useMemo<I18nValue>(() => ({
    locale,
    t: getDictionary(locale) as Record<string, any>,
    setLocale(next) {
      setLocaleState(next)
      document.cookie = `seazone_locale=${next}; path=/; max-age=31536000; samesite=lax`
      window.localStorage.setItem('seazone_locale', next)
      router.refresh()
    },
  }), [locale, router])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside I18nProvider')
  return value
}

export function useT(): Record<string, any> {
  return useI18n().t
}

export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`))
}
