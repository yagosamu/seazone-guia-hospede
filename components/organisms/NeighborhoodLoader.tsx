'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Loader2, RefreshCcw } from 'lucide-react'
import { SectionHeader } from '@/components/atoms/SectionHeader'

type NeighborhoodLoaderProps = {
  code: string
  sectionNumber: string
}

type Stage = {
  threshold: number
  label: string
}

const STAGES: Stage[] = [
  { threshold: 0, label: 'Buscando lugares reais perto do imóvel' },
  { threshold: 12_000, label: 'Curando recomendações personalizadas' },
  { threshold: 30_000, label: 'Finalizando o guia da região' },
  { threshold: 50_000, label: 'Quase pronto, polindo as descrições' },
]

export function NeighborhoodLoader({ code, sectionNumber }: NeighborhoodLoaderProps) {
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
      const next = STAGES.reduce(
        (acc, s, i) => (elapsed >= s.threshold ? i : acc),
        0,
      )
      setStageIdx(next)
    }, 1000)

    try {
      const res = await fetch('/api/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string
          message?: string
        }
        const friendly = friendlyMessage(payload.error, payload.message)
        throw new Error(friendly)
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
      <section className="space-y-6">
        <SectionHeader
          number={sectionNumber}
          eyebrow="Arredores"
          title="Não conseguimos gerar o guia agora"
        />
        <div
          className="flex flex-col gap-4 rounded-2xl border p-6 md:flex-row md:items-center md:justify-between md:p-8"
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
              {errorMsg ?? 'Algo deu errado durante a geração. Tente novamente.'}
            </p>
          </div>
          <button
            type="button"
            onClick={run}
            className="inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition hover:brightness-110 active:scale-[0.97]"
            style={{ background: '#FF6B5B', color: '#FAFAF7' }}
          >
            <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      </section>
    )
  }

  const currentStage = STAGES[stageIdx]?.label ?? 'Preparando...'

  return (
    <section className="space-y-8">
      <SectionHeader
        number={sectionNumber}
        eyebrow="Arredores"
        title="Estamos preparando seu guia personalizado"
        description="Buscando restaurantes, atrações e serviços reais perto do imóvel. Isso leva cerca de 45 segundos na primeira visita. Depois fica em cache."
      />

      <div className="border-border bg-card flex items-center gap-4 rounded-2xl border px-5 py-4">
        <Loader2
          className="h-5 w-5 shrink-0 animate-spin"
          style={{ color: 'var(--seazone-blue)' }}
          aria-hidden="true"
        />
        <p className="text-foreground text-sm font-medium">{currentStage}</p>
      </div>

      <div className="space-y-10">
        <SkeletonGroup title="Restaurantes" count={4} />
        <SkeletonGroup title="Atrações" count={4} />
        <SkeletonGroup title="Essenciais" count={3} />
      </div>
    </section>
  )
}

function SkeletonGroup({ title, count }: { title: string; count: number }) {
  return (
    <div className="space-y-3">
      <h3 className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
        {title}
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card animate-pulse rounded-xl border p-5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="bg-muted mb-3 h-3 w-6 rounded" />
            <div className="bg-muted mb-2 h-4 w-3/4 rounded" />
            <div className="bg-muted mb-3 h-3 w-1/3 rounded" />
            <div className="bg-muted h-3 w-full rounded" />
            <div className="bg-muted mt-1.5 h-3 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function friendlyMessage(error?: string, message?: string): string {
  if (error === 'TavilyError') return 'Não conseguimos buscar lugares reais agora. Tente novamente em instantes.'
  if (error === 'AnthropicError') return 'Nossa IA está temporariamente indisponível. Tente novamente.'
  if (error === 'MaxIterationsError') return 'A geração levou tempo demais. Tente novamente.'
  if (error === 'ValidationError') return 'Recebemos uma resposta inesperada. Tente regenerar.'
  if (error === 'property_not_found') return 'Imóvel não encontrado.'
  return message ?? 'Algo deu errado. Tente novamente.'
}
