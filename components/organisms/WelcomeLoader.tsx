'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, RefreshCcw, Sparkles } from 'lucide-react'
import { useT } from '@/lib/i18n/provider'

type WelcomeLoaderProps = {
  code: string
}

type Stage = {
  threshold: number
  label: string
}

const STAGE_THRESHOLDS = [0, 4_000, 8_000]

export function WelcomeLoader({ code }: WelcomeLoaderProps) {
  const t = useT()
  const stages: Stage[] = STAGE_THRESHOLDS.map((threshold, index) => ({ threshold, label: t.welcomeLoader.stages[index] ?? '' }))
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [stageIdx, setStageIdx] = useState(0)
  const startedAt = useRef<number | null>(null)
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== 'idle') return
    void run()
    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run() {
    setStatus('loading')
    setErrorMsg(null)
    setStageIdx(0)
    startedAt.current = Date.now()
    if (stageTimerRef.current) clearInterval(stageTimerRef.current)
    stageTimerRef.current = setInterval(() => {
      if (!startedAt.current) return
      const elapsed = Date.now() - startedAt.current
      const next = stages.reduce((acc, s, i) => (elapsed >= s.threshold ? i : acc), 0)
      setStageIdx(next)
    }, 800)

    try {
      const res = await fetch('/api/generate-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string
          message?: string
        }
        throw new Error(payload.message ?? payload.error ?? 'Erro ao gerar boas-vindas.')
      }
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado.'
      setErrorMsg(message)
      setStatus('error')
    } finally {
      if (stageTimerRef.current) {
        clearInterval(stageTimerRef.current)
        stageTimerRef.current = null
      }
    }
  }

  if (status === 'error') {
    return (
      <section
        className="flex flex-col gap-3 rounded-2xl border p-5 md:flex-row md:items-center md:justify-between md:p-6"
        style={{
          background: 'rgba(255,107,91,0.06)',
          borderColor: 'rgba(255,107,91,0.35)',
        }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: '#FF6B5B' }}
            aria-hidden="true"
          />
          <p className="text-foreground text-sm leading-relaxed">
            {errorMsg ?? t.welcomeLoader.error}
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition hover:brightness-110 active:scale-[0.97]"
          style={{ background: '#FF6B5B', color: '#FAFAF7' }}
        >
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {t.welcomeLoader.retry}
        </button>
      </section>
    )
  }

  const currentStage = stages[stageIdx]?.label ?? t.welcomeLoader.fallbackStage

  return (
    <section className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,107,91,0.12)' }}
      >
        <Sparkles className="h-5 w-5" style={{ color: '#FF6B5B' }} aria-hidden="true" />
      </div>
      <div className="flex-1 space-y-3">
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: '#FF6B5B' }}
        >
          {t.welcomeLoader.eyebrow}
        </p>
        <div className="flex items-center gap-3">
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin"
            style={{ color: 'var(--seazone-blue)' }}
            aria-hidden="true"
          />
          <p className="text-foreground text-base font-medium md:text-lg">{currentStage}</p>
        </div>
        <div className="space-y-2">
          <div className="bg-muted h-3 w-full max-w-xl animate-pulse rounded" />
          <div className="bg-muted h-3 w-4/5 max-w-lg animate-pulse rounded" style={{ animationDelay: '120ms' }} />
          <div className="bg-muted h-3 w-3/5 max-w-md animate-pulse rounded" style={{ animationDelay: '240ms' }} />
        </div>
      </div>
    </section>
  )
}
