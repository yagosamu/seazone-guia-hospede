'use client'

import { useEffect, useState } from 'react'
import { useI18n } from './provider'

export function useTranslatedTexts(texts: string[]) {
  const { locale } = useI18n()
  const [translated, setTranslated] = useState(texts)
  useEffect(() => {
    if (locale === 'pt') { setTranslated(texts); return }
    let cancelled = false
    void fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texts, to: locale }) })
      .then(async (res) => { if (!res.ok) throw new Error(); return res.json() as Promise<{ translations: string[] }> })
      .then((data) => { if (!cancelled && data.translations.length === texts.length) setTranslated(data.translations) })
      .catch(() => { if (!cancelled) setTranslated(texts) })
    return () => { cancelled = true }
  }, [locale, JSON.stringify(texts)])
  return { translated }
}
