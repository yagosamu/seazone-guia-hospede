'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCcw,
  Sparkles,
  X,
} from 'lucide-react'
import type { Itinerary, ItineraryRequest, WhoTravels, Vibe, Transport } from '@/lib/itinerary/types'
import type { RefinementTurn } from '@/lib/itinerary/refine-schema'
import { interpolate, useI18n, useT } from '@/lib/i18n/provider'
import { ItineraryDayCard } from '@/components/molecules/ItineraryDayCard'

type Stage = 'questions' | 'loading' | 'result' | 'error'
type ItineraryModalProps = { code: string; onClose: () => void }

const LOADING_STAGES = [0, 8_000, 18_000, 30_000]
const MAX_REFINEMENTS = 5

const DAY_OPTIONS = ['1', '2', '3', '4'] as const
const WHO_OPTIONS: WhoTravels[] = ['couple', 'family_with_kids', 'solo', 'friends']
const VIBE_OPTIONS: Vibe[] = ['relax', 'adventure', 'gastronomy', 'culture', 'nightlife']
const TRANSPORT_OPTIONS: Transport[] = ['walk', 'car', 'mixed']

export function ItineraryModal({ code, onClose }: ItineraryModalProps) {
  const { locale } = useI18n()
  const t = useT()
  const titleId = useId()

  const [stage, setStage] = useState<Stage>('questions')
  const [form, setForm] = useState<ItineraryRequest>({
    days: 2,
    who: 'couple',
    vibe: 'relax',
    transport: 'mixed',
    restrictions: '',
  })
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [originalRequest, setOriginalRequest] = useState<Omit<ItineraryRequest, 'restrictions'> & { restrictions?: string } | null>(null)
  const [history, setHistory] = useState<RefinementTurn[]>([])
  const [refineInput, setRefineInput] = useState('')
  const [refining, setRefining] = useState(false)
  const [refineError, setRefineError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingStage, setLoadingStage] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Esc fecha
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Estágios temporais do loading
  useEffect(() => {
    if (stage !== 'loading') {
      if (stageTimerRef.current) {
        clearInterval(stageTimerRef.current)
        stageTimerRef.current = null
      }
      return
    }
    startedAtRef.current = Date.now()
    setLoadingStage(0)
    stageTimerRef.current = setInterval(() => {
      if (!startedAtRef.current) return
      const elapsed = Date.now() - startedAtRef.current
      const next = LOADING_STAGES.reduce((acc, threshold, i) => (elapsed >= threshold ? i : acc), 0)
      setLoadingStage(next)
    }, 800)
    return () => {
      if (stageTimerRef.current) clearInterval(stageTimerRef.current)
    }
  }, [stage])

  // Auto-scroll quando muda itinerary (após refinement)
  useEffect(() => {
    if (stage === 'result' && bodyRef.current) {
      bodyRef.current.scrollTop = 0
    }
  }, [itinerary, stage])

  async function handleGenerate() {
    setStage('loading')
    setError(null)
    try {
      const payload = { code, ...form, locale }
      if (!form.restrictions?.trim()) delete (payload as Partial<typeof payload>).restrictions
      const res = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string; reason?: string }
        throw new Error((data.reason && t.itinerary.error.reasons?.[data.reason]) ?? data.message ?? 'failed')
      }
      const data = (await res.json()) as { itinerary: Itinerary }
      setItinerary(data.itinerary)
      const { days, who, vibe, transport, restrictions } = form
      setOriginalRequest({ days, who, vibe, transport, restrictions: restrictions?.trim() || undefined })
      setHistory([])
      setStage('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'erro')
      setStage('error')
    }
  }

  async function handleRefine() {
    if (!itinerary || !originalRequest || !refineInput.trim()) return
    const message = refineInput.trim()
    setRefining(true)
    setRefineError(null)
    const newHistory: RefinementTurn[] = [...history, { role: 'user', content: message }]
    try {
      const res = await fetch('/api/itinerary/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          currentItinerary: itinerary,
          originalRequest,
          refinementMessage: message,
          history,
          locale,
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string; reason?: string }
        throw new Error((data.reason && t.itinerary.error.reasons?.[data.reason]) ?? data.message ?? 'refine_failed')
      }
      const data = (await res.json()) as { itinerary: Itinerary }
      setItinerary(data.itinerary)
      setHistory([...newHistory, { role: 'assistant', content: data.itinerary.intro }])
      setRefineInput('')
    } catch (err) {
      setRefineError(err instanceof Error && err.message !== 'refine_failed' ? err.message : (t.itinerary.refinement?.error ?? 'Erro ao ajustar'))
    } finally {
      setRefining(false)
    }
  }

  function handleRedo() {
    setStage('questions')
    setItinerary(null)
    setOriginalRequest(null)
    setHistory([])
    setRefineInput('')
    setRefineError(null)
    setExpanded(false)
  }

  function handleCopy() {
    if (!itinerary) return
    const text = formatItineraryText(itinerary, t)
    void navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const userTurns = history.filter((h) => h.role === 'user')
  const refinementLimitReached = userTurns.length >= MAX_REFINEMENTS

  const containerClass = expanded
    ? 'relative flex h-full w-full flex-col bg-card shadow-2xl md:max-w-none md:rounded-none'
    : 'relative flex h-[92vh] w-full flex-col bg-card shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-[680px] md:rounded-2xl'

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label={t.itinerary.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default backdrop-blur-sm"
        style={{ background: 'rgba(8, 28, 52, 0.55)' }}
      />

      <div className={containerClass}>
        <header className="border-border flex items-start justify-between gap-4 border-b px-5 py-4 md:px-7 md:py-5">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: '#FF6B5B' }} aria-hidden="true" />
              <span
                className="text-[10px] font-bold tracking-[0.22em] uppercase"
                style={{ color: '#FF6B5B' }}
              >
                {t.itinerary.cta}
              </span>
            </div>
            <h2 id={titleId} className="text-foreground text-lg font-bold tracking-tight md:text-xl">
              {t.itinerary.modalTitle}
            </h2>
            {stage === 'questions' ? (
              <p className="text-muted-foreground mt-1 text-sm leading-snug">
                {t.itinerary.modalSubtitle}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {stage === 'result' ? (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? t.itinerary.result.collapse : t.itinerary.result.expand}
                className="hover:bg-secondary rounded-full p-2 transition md:hidden"
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.itinerary.close}
              className="hover:bg-secondary rounded-full p-2 transition"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
          {stage === 'questions' ? (
            <QuestionsForm form={form} setForm={setForm} t={t} />
          ) : stage === 'loading' ? (
            <LoadingState stageIdx={loadingStage} t={t} />
          ) : stage === 'error' ? (
            <ErrorState error={error} onRetry={() => setStage('questions')} t={t} />
          ) : (
            <ResultState
              itinerary={itinerary!}
              history={history}
              refinementLimitReached={refinementLimitReached}
              refining={refining}
              refineInput={refineInput}
              setRefineInput={setRefineInput}
              refineError={refineError}
              onRefine={handleRefine}
              t={t}
            />
          )}
        </div>

        {stage === 'questions' ? (
          <footer className="border-border bg-card border-t px-5 py-4 md:px-7">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold tracking-wide transition hover:brightness-110 active:scale-[0.98] md:w-auto md:px-7"
              style={{ background: '#FF6B5B', color: '#FAFAF7' }}
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t.itinerary.submit}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </footer>
        ) : stage === 'result' ? (
          <footer className="border-border bg-card flex flex-col gap-2 border-t px-5 py-4 md:flex-row md:items-center md:justify-between md:px-7">
            <button
              type="button"
              onClick={handleRedo}
              className="border-border text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide uppercase transition"
            >
              <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t.itinerary.result.redo}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition hover:brightness-110"
              style={{ background: '#0F4C81', color: '#FAFAF7' }}
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
              {copied ? t.itinerary.result.copied : t.itinerary.result.copy}
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  )
}

function QuestionsForm({
  form,
  setForm,
  t,
}: {
  form: ItineraryRequest
  setForm: (next: ItineraryRequest) => void
  t: ReturnType<typeof useT>
}) {
  return (
    <div className="space-y-6">
      <PillGroup
        label={t.itinerary.questions.days}
        options={DAY_OPTIONS}
        labels={t.itinerary.questions.daysOptions}
        value={String(form.days)}
        onChange={(v) => setForm({ ...form, days: Number(v) as ItineraryRequest['days'] })}
      />
      <PillGroup
        label={t.itinerary.questions.who}
        options={WHO_OPTIONS}
        labels={t.itinerary.questions.whoOptions}
        value={form.who}
        onChange={(v) => setForm({ ...form, who: v })}
      />
      <PillGroup
        label={t.itinerary.questions.vibe}
        options={VIBE_OPTIONS}
        labels={t.itinerary.questions.vibeOptions}
        value={form.vibe}
        onChange={(v) => setForm({ ...form, vibe: v })}
      />
      <StackedGroup
        label={t.itinerary.questions.transport}
        options={TRANSPORT_OPTIONS}
        labels={t.itinerary.questions.transportOptions}
        value={form.transport}
        onChange={(v) => setForm({ ...form, transport: v })}
      />
      <div className="space-y-2">
        <label className="text-foreground block text-sm font-semibold">
          {t.itinerary.questions.restrictions}
        </label>
        <textarea
          rows={3}
          value={form.restrictions ?? ''}
          onChange={(e) => setForm({ ...form, restrictions: e.target.value })}
          placeholder={t.itinerary.questions.restrictionsPlaceholder}
          className="border-border bg-card text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[var(--seazone-blue)] focus:ring-2 focus:ring-[var(--seazone-blue)]/20"
        />
      </div>
    </div>
  )
}

function PillGroup<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  labels: Record<string, string>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-foreground text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt === value
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={active}
              className="rounded-full border px-4 py-2 text-sm font-medium transition"
              style={
                active
                  ? { background: 'var(--seazone-blue)', color: '#FAFAF7', borderColor: 'var(--seazone-blue)' }
                  : { borderColor: 'var(--border)', color: 'var(--foreground)' }
              }
            >
              {labels[opt] ?? opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StackedGroup<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string
  options: readonly T[]
  labels: Record<string, string>
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-foreground text-sm font-semibold">{label}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const active = opt === value
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              aria-pressed={active}
              className="flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition"
              style={
                active
                  ? { background: 'var(--seazone-blue)', color: '#FAFAF7', borderColor: 'var(--seazone-blue)' }
                  : { borderColor: 'var(--border)', color: 'var(--foreground)' }
              }
            >
              <span className="font-medium">{labels[opt] ?? opt}</span>
              {active ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LoadingState({ stageIdx, t }: { stageIdx: number; t: ReturnType<typeof useT> }) {
  const label = t.itinerary.loading.stages[stageIdx] ?? t.itinerary.loading.stages[0]
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,107,91,0.12)' }}
      >
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: '#FF6B5B' }}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-1.5 max-w-sm">
        <p className="text-foreground text-base font-semibold md:text-lg">
          {t.itinerary.loading.title}
        </p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
  t,
}: {
  error: string | null
  onRetry: () => void
  t: ReturnType<typeof useT>
}) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,107,91,0.12)' }}
      >
        <AlertTriangle className="h-5 w-5" style={{ color: '#FF6B5B' }} aria-hidden="true" />
      </div>
      <div className="space-y-2 max-w-sm">
        <p className="text-foreground text-base font-semibold">{t.itinerary.error.title}</p>
        {error ? <p className="text-muted-foreground text-sm">{error}</p> : null}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition hover:brightness-110"
        style={{ background: '#FF6B5B', color: '#FAFAF7' }}
      >
        <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
        {t.itinerary.error.retry}
      </button>
    </div>
  )
}

function ResultState({
  itinerary,
  history,
  refinementLimitReached,
  refining,
  refineInput,
  setRefineInput,
  refineError,
  onRefine,
  t,
}: {
  itinerary: Itinerary
  history: RefinementTurn[]
  refinementLimitReached: boolean
  refining: boolean
  refineInput: string
  setRefineInput: (v: string) => void
  refineError: string | null
  onRefine: () => void
  t: ReturnType<typeof useT>
}) {
  const userTurns = history.filter((h) => h.role === 'user')
  const youAsked = t.itinerary.refinement?.youAsked ?? 'Você pediu'

  return (
    <div className="space-y-6">
      {userTurns.length > 0 ? (
        <div className="space-y-2">
          {userTurns.map((turn, i) => (
            <div
              key={i}
              className="rounded-r-md py-2 pr-3 pl-3 text-xs leading-relaxed"
              style={{
                background: 'rgba(255,107,91,0.06)',
                borderLeft: '2px solid #FF6B5B',
                color: 'var(--muted-foreground)',
              }}
            >
              <span className="font-semibold" style={{ color: '#FF6B5B' }}>
                {youAsked}:
              </span>{' '}
              {turn.content}
            </div>
          ))}
        </div>
      ) : null}

      <p className="text-foreground text-[15px] leading-relaxed">{itinerary.intro}</p>

      {refining ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--seazone-blue)' }} aria-hidden="true" />
          <p className="text-muted-foreground text-sm">
            {t.itinerary.refinement?.loading ?? 'Ajustando seu roteiro...'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {itinerary.days.map((day) => (
            <ItineraryDayCard key={day.day_number} day={day} />
          ))}
          {itinerary.closing_tip ? (
            <aside
              className="relative overflow-hidden rounded-xl px-5 py-4"
              style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
            >
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase" style={{ color: '#FF6B5B' }}>
                {t.neighborhood.seasonalTip}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{itinerary.closing_tip}</p>
            </aside>
          ) : null}
        </div>
      )}

      <div className="border-border space-y-3 border-t pt-5">
        <p className="text-foreground text-sm font-semibold">
          {t.itinerary.refinement?.title ?? 'Quer ajustar algo?'}
        </p>
        {refinementLimitReached ? (
          <p className="text-muted-foreground text-xs leading-relaxed">
            {t.itinerary.refinement?.limit ?? 'Limite atingido.'}
          </p>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <textarea
                value={refineInput}
                onChange={(e) => setRefineInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    onRefine()
                  }
                }}
                placeholder={t.itinerary.refinement?.placeholder ?? ''}
                disabled={refining}
                rows={2}
                className="border-border bg-card text-foreground placeholder:text-muted-foreground flex-1 resize-none rounded-xl border px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[var(--seazone-blue)] focus:ring-2 focus:ring-[var(--seazone-blue)]/20"
              />
              <button
                type="button"
                onClick={onRefine}
                disabled={refining || !refineInput.trim()}
                aria-label={t.itinerary.refinement?.send ?? 'Ajustar'}
                className="inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-3 text-xs font-semibold tracking-wide uppercase transition hover:brightness-110 disabled:opacity-40"
                style={{ background: '#FF6B5B', color: '#FAFAF7' }}
              >
                {refining ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : t.itinerary.refinement?.send ?? 'Ajustar'}
              </button>
            </div>
            {refineError ? (
              <p className="text-xs leading-relaxed" style={{ color: '#FF6B5B' }}>
                {refineError}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

function formatItineraryText(itinerary: Itinerary, t: ReturnType<typeof useT>): string {
  const lines: string[] = [itinerary.intro, '']
  for (const day of itinerary.days) {
    const dayLabel = interpolate(t.itinerary.result.dayLabel, { n: day.day_number })
    lines.push(`━━━ ${dayLabel}: ${day.title} ━━━`, '')
    for (const a of day.activities) {
      const period = t.itinerary.result.periods[a.period as keyof typeof t.itinerary.result.periods]
      const meta = [a.duration, a.distance_from_property].filter(Boolean).join(' · ')
      lines.push(`${period} — ${a.title}${a.place ? ` (${a.place})` : ''}`)
      if (meta) lines.push(`  ${meta}`)
      lines.push(`  ${a.description}`, '')
    }
  }
  if (itinerary.closing_tip) lines.push('━━━', itinerary.closing_tip)
  return lines.join('\n')
}
