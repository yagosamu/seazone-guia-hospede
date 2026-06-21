import { en } from './en'
import { es } from './es'
import { pt } from './pt'
import type { Dictionary, Locale } from '../types'

export function getDictionary(locale: Locale): Dictionary {
  return { pt, en, es }[locale]
}
