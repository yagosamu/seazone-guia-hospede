'use client'

import Link from 'next/link'
import { MapPinOff } from 'lucide-react'
import { interpolate, useT } from '@/lib/i18n/provider'

export default function NotFound() {
  const t = useT()
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="max-w-md space-y-6 text-center">
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: 'rgba(255,107,91,0.1)' }}
        >
          <MapPinOff
            className="h-7 w-7"
            style={{ color: '#FF6B5B' }}
            aria-hidden="true"
          />
        </div>
        <div className="space-y-3">
          <p
            className="text-[10px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: '#FF6B5B' }}
          >
            {t.notFound.eyebrow}
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {t.notFound.title}
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            {interpolate(t.notFound.description, { format: 'XXX000', example: 'FLN001' })}
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
        >
          {t.notFound.cta}
        </Link>
      </div>
    </main>
  )
}
