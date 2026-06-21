'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

type CopyButtonProps = {
  value: string
  variant?: 'default' | 'coral'
  label?: string
  copiedLabel?: string
}

export function CopyButton({ value, variant = 'default', label = '', copiedLabel = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  const styles =
    variant === 'coral'
      ? { background: '#FF6B5B', color: '#FAFAF7', border: 'none' }
      : { background: 'transparent', color: 'var(--foreground)', border: '1px solid var(--border)' }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition hover:brightness-110 active:scale-[0.97]"
      style={styles}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? copiedLabel : label}
    </button>
  )
}
