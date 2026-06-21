'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Property } from '@/db/schema'
import { interpolate, useT } from '@/lib/i18n/provider'

const AUTOPLAY_INTERVAL = 6000

type PropertyHeroProps = {
  property: Property
}

export function PropertyHero({ property }: PropertyHeroProps) {
  const t = useT()
  const images = property.images
  const total = images.length
  const [activeIdx, setActiveIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const access = property.operational.is_self_checkin
    ? t.hero.accessLabels.selfCheckin
    : (t.hero.accessLabels[property.operational.property_access_type] ?? property.operational.property_access_type)

  const goPrev = useCallback(
    () => setActiveIdx((i) => (i - 1 + total) % total),
    [total],
  )
  const goNext = useCallback(() => setActiveIdx((i) => (i + 1) % total), [total])

  useEffect(() => {
    if (total <= 1 || paused) return
    const id = setInterval(() => setActiveIdx((i) => (i + 1) % total), AUTOPLAY_INTERVAL)
    return () => clearInterval(id)
  }, [total, paused])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current
    const end = e.changedTouches[0]?.clientX ?? null
    if (start === null || end === null) return
    const diff = end - start
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  return (
    <section className="relative w-full">
      <div
        className="relative h-[60vh] min-h-[420px] w-full overflow-hidden md:h-[72vh] md:min-h-[520px]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeIdx ? 1 : 0 }}
            aria-hidden={i === activeIdx ? 'false' : 'true'}
          >
            <Image
              src={src}
              alt={`${property.name} foto ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 75% at 50% 50%, transparent 35%, rgba(0,0,0,0.45) 100%)',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(15,76,129,0.05) 0%, rgba(15,76,129,0.02) 30%, rgba(15,76,129,0.78) 100%)',
          }}
          aria-hidden="true"
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label={t.hero.prevPhoto}
              className="absolute top-1/2 left-3 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/30 md:left-6 md:flex"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={t.hero.nextPhoto}
              className="absolute top-1/2 right-3 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/30 md:right-6 md:flex"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-6xl px-6 pb-10 md:px-10 md:pb-16">
            <div className="max-w-3xl text-[#FAFAF7]">
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="text-sm font-semibold tracking-[0.16em] uppercase md:text-base"
                  style={{ color: '#FF6B5B' }}
                >
                  {t.hero.welcomeTo}
                </span>
                <span className="h-px w-10" style={{ background: '#FF6B5B' }} aria-hidden="true" />
                <span className="text-sm font-medium tracking-[0.1em] uppercase opacity-80 md:text-base">
                  {property.property_type}
                </span>
              </div>
              <h1 className="text-3xl leading-[1.1] font-bold tracking-tight md:text-5xl lg:text-6xl">
                {property.name}
              </h1>
              <div
                className="mt-5 mb-4 h-[2px] w-12"
                style={{ background: '#FF6B5B' }}
                aria-hidden="true"
              />
              <p className="text-sm md:text-base">
                <span className="opacity-90">{property.address.neighborhood}</span>
                <span className="mx-2 opacity-50">·</span>
                <span className="opacity-90">{property.address.city}</span>
                <span className="mx-2 opacity-50">·</span>
                <span className="opacity-90">{property.address.state}</span>
              </p>
            </div>

            {total > 1 ? (
              <div className="mt-6 flex items-center gap-2" role="tablist" aria-label={t.hero.photosNav}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIdx}
                    aria-label={interpolate(t.hero.photoOfTotal, { n: i + 1, total })}
                    onClick={() => setActiveIdx(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === activeIdx ? 24 : 8,
                      background: i === activeIdx ? '#FF6B5B' : 'rgba(255,255,255,0.55)',
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-border bg-background border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-0 px-6 md:grid-cols-3 md:px-10">
          <HeroStat label={t.hero.checkIn} value={property.rules.check_in_time} />
          <HeroStat label={t.hero.checkOut} value={property.rules.check_out_time} divider />
          <HeroStat label={t.hero.access} value={access} divider />
        </div>
      </div>
    </section>
  )
}

function HeroStat({
  label,
  value,
  divider = false,
}: {
  label: string
  value: string
  divider?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-1 py-6 md:py-7 ${
        divider ? 'border-border border-t md:border-t-0 md:border-l md:pl-8' : ''
      } md:pr-8`}
    >
      <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
        {label}
      </span>
      <span
        className="nums-tabular text-2xl leading-tight font-bold tracking-tight md:text-3xl"
        style={{ color: 'var(--seazone-blue)' }}
      >
        {value}
      </span>
    </div>
  )
}
