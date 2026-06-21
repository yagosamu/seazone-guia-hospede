'use client'

import { useI18n } from '@/lib/i18n/provider'
import { LOCALES } from '@/lib/i18n/types'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  return <div aria-label={t.languageSwitcher.label} className="flex rounded-full bg-black/35 p-1 text-xs font-bold text-white backdrop-blur">
    {LOCALES.map((item) => <button key={item} type="button" onClick={() => setLocale(item)} className={`rounded-full px-2.5 py-1 ${locale === item ? 'bg-white text-slate-900' : ''}`}>{t.languageSwitcher[item]}</button>)}
  </div>
}
