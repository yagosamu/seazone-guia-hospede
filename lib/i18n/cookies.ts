import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, LOCALES, type Locale } from './types'

const COOKIE_NAME = 'seazone_locale'

export async function getServerLocale(): Promise<Locale> {
  const value = (await cookies()).get(COOKIE_NAME)?.value
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE
}
