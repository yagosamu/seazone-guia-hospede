import type { Metadata } from 'next'
import { JetBrains_Mono, Manrope } from 'next/font/google'
import './globals.css'
import { getServerLocale } from '@/lib/i18n/cookies'
import { I18nProvider } from '@/lib/i18n/provider'

const manrope = Manrope({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Seazone · Guia Digital do Hóspede',
  description: 'Guia personalizado para hóspedes Seazone',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getServerLocale()
  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col"><I18nProvider initialLocale={locale}>{children}</I18nProvider></body>
    </html>
  )
}
