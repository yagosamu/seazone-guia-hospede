import Link from 'next/link'
import { MapPinOff } from 'lucide-react'

export default function NotFound() {
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
            Erro 404
          </p>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Imóvel não encontrado
          </h1>
          <p className="text-muted-foreground text-[15px] leading-relaxed">
            Verifique o código no e-mail da sua reserva. Códigos válidos têm o formato{' '}
            <code className="bg-secondary rounded px-1.5 py-0.5 font-mono text-[13px]">
              XXX000
            </code>
            , por exemplo{' '}
            <code className="bg-secondary rounded px-1.5 py-0.5 font-mono text-[13px]">
              FLN001
            </code>
            .
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:brightness-110 active:scale-[0.98]"
          style={{ background: 'var(--seazone-blue)', color: '#FAFAF7' }}
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}
