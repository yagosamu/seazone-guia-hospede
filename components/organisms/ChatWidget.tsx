'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { ArrowUp, MessageCircle, RotateCcw, Sparkles, X } from 'lucide-react'
import { interpolate, useI18n, useT } from '@/lib/i18n/provider'
import { ItineraryModal } from './ItineraryModal'

type ChatWidgetProps = {
  code: string
  propertyName: string
  hostFirstName: string
}

type Suggestion = { id: string; label: string; prompt: string }

export function ChatWidget({ code, propertyName, hostFirstName }: ChatWidgetProps) {
  const { locale, t } = useI18n()
  const suggestions: Suggestion[] = [
    { id: 'wifi', label: t.chat.wifi, prompt: t.chat.wifi }, { id: 'checkin', label: t.chat.checkin, prompt: t.chat.checkin }, { id: 'pet', label: t.chat.pet, prompt: t.chat.pet }, { id: 'food', label: t.chat.food, prompt: t.chat.food },
  ]
  const [open, setOpen] = useState(false)
  const [itineraryOpen, setItineraryOpen] = useState(false)
  const [input, setInput] = useState('')
  const titleId = useId()
  const scrollRef = useRef<HTMLDivElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { code, messages, locale },
        }),
      }),
    [code, locale],
  )

  const { messages, sendMessage, setMessages, status, error, stop, regenerate } = useChat({
    transport,
  })

  function handleNewConversation() {
    setMessages([])
    setInput('')
  }

  const isLoading = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (!open) return
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open, isLoading])

  function handleSubmit(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    void sendMessage({ text: trimmed })
    setInput('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.chat.openLabel}
        className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold shadow-lg shadow-black/15 transition hover:scale-[1.02] hover:brightness-110 active:scale-[0.98] md:right-8 md:bottom-8"
        style={{ background: '#FF6B5B', color: '#FAFAF7' }}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {t.chat.launcherLabel}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex md:items-stretch md:justify-end"
          aria-modal="true"
          role="dialog"
          aria-labelledby={titleId}
        >
          <button
            type="button"
            aria-label={t.chat.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default"
            style={{ background: 'rgba(8, 28, 52, 0.45)' }}
          />

          <div className="bg-background relative flex h-full w-full flex-col shadow-2xl md:w-[440px] md:max-w-[90vw]">
            <header
              className="flex items-center justify-between px-5 py-4 md:px-6"
              style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,107,91,0.22)' }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: '#FF6B5B' }} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p
                    id={titleId}
                    className="text-sm font-bold tracking-tight"
                  >
                    {t.chat.headerTitle}
                  </p>
                  <p className="truncate text-[11px] tracking-wide opacity-80">
                    {propertyName}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {messages.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleNewConversation}
                    className="rounded-full p-2 transition hover:bg-white/10"
                    aria-label={t.chat.newConversation}
                    title={t.chat.newConversation}
                  >
                    <RotateCcw className="h-4 w-4" style={{ color: '#FAFAF7' }} aria-hidden="true" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full p-2 transition hover:bg-white/10"
                  aria-label={t.chat.close}
                >
                  <X className="h-4 w-4" style={{ color: '#FAFAF7' }} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-6 md:px-6"
              style={{ background: 'var(--seazone-paper)' }}
            >
              {messages.length === 0 ? (
                <EmptyState
                  suggestions={suggestions}
                  onPick={(prompt) => handleSubmit(prompt)}
                  onOpenItinerary={() => setItineraryOpen(true)}
                />
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} />
                  ))}
                  {status === 'submitted' ? <TypingDots /> : null}
                </div>
              )}

              {error ? (
                <div
                  className="mt-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(255,107,91,0.07)',
                    borderColor: 'rgba(255,107,91,0.35)',
                  }}
                >
                  <p className="text-foreground leading-relaxed">
                    {t.chat.errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase"
                    style={{ background: '#FF6B5B', color: '#FAFAF7' }}
                  >
                    {t.chat.errorRetry}
                  </button>
                </div>
              ) : null}
            </div>

            <footer className="border-border bg-background border-t p-3 md:p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSubmit(input)
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(input)
                    }
                  }}
                  placeholder={t.chat.placeholder}
                  rows={1}
                  className="border-border bg-card text-foreground placeholder:text-muted-foreground max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm leading-relaxed outline-none focus:border-[var(--seazone-blue)] focus:ring-2 focus:ring-[var(--seazone-blue)]/20"
                  aria-label={t.chat.questionLabel}
                />
                {isLoading ? (
                  <button
                    type="button"
                    onClick={() => stop()}
                    aria-label={t.chat.stop}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition hover:brightness-110"
                    style={{ borderColor: 'var(--seazone-blue)', color: 'var(--seazone-blue)' }}
                  >
                    <span className="block h-3 w-3 rounded-[2px] bg-current" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label={t.chat.send}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition hover:brightness-110 disabled:opacity-40"
                    style={{ background: '#FF6B5B', color: '#FAFAF7' }}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </form>
              <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
                {interpolate(t.chat.footer, { hostName: hostFirstName })}
              </p>
            </footer>
          </div>
        </div>
      ) : null}

      {itineraryOpen ? (
        <ItineraryModal code={code} onClose={() => setItineraryOpen(false)} />
      ) : null}
    </>
  )
}

function EmptyState({
  suggestions,
  onPick,
  onOpenItinerary,
}: {
  suggestions: Suggestion[]
  onPick: (prompt: string) => void
  onOpenItinerary: () => void
}) {
  const t = useT()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-8 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,107,91,0.12)' }}
      >
        <MessageCircle className="h-6 w-6" style={{ color: '#FF6B5B' }} aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h3 className="text-foreground text-lg font-bold tracking-tight">
          {t.chat.emptyTitle}
        </h3>
        <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
          {t.chat.emptyDescription}
        </p>
      </div>
      <div className="grid w-full max-w-sm gap-2">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPick(s.prompt)}
            className="border-border bg-card hover:border-[var(--seazone-blue)]/40 hover:bg-secondary/60 rounded-full border px-4 py-2.5 text-left text-sm font-medium transition"
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onOpenItinerary}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {t.itinerary.modalTitle}
        </button>
      </div>
    </div>
  )
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const rawText = message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
  const text = isUser ? rawText : stripMarkdown(rawText)

  if (!text && !isUser) return null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? '' : 'border-border border-l-2 bg-card'
        }`}
        style={
          isUser
            ? { background: 'var(--seazone-coral-soft)', color: 'var(--foreground)' }
            : { borderLeftColor: 'var(--seazone-coral)' }
        }
      >
        {text || (isUser ? '' : '...')}
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="border-border bg-card flex items-center gap-1.5 rounded-2xl border-l-2 px-4 py-3" style={{ borderLeftColor: 'var(--seazone-coral)' }}>
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ background: 'var(--seazone-blue)', animationDelay: '0ms' }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ background: 'var(--seazone-blue)', animationDelay: '120ms' }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full"
          style={{ background: 'var(--seazone-blue)', animationDelay: '240ms' }}
        />
      </div>
    </div>
  )
}
