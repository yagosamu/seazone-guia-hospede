import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const SAMPLE_CODES = ['FLN001', 'GRM001', 'BAL001', 'RJ001'] as const

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="space-y-3">
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: '#FF6B5B' }}
        >
          Seazone · Guia Digital do Hóspede
        </p>
        <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
          Tudo sobre sua estadia, em um só lugar.
        </h1>
        <p className="text-muted-foreground max-w-xl text-[15px] leading-relaxed md:text-base">
          Cada imóvel Seazone tem um link único com WiFi, regras, contato do anfitrião e dicas
          locais geradas para o bairro onde você está.
        </p>
      </div>
      <div className="mt-10 space-y-3">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
          Imóveis de exemplo
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {SAMPLE_CODES.map((code) => (
            <li key={code}>
              <Link
                href={`/${code}`}
                className="group bg-card hover:border-foreground/30 flex items-center justify-between rounded-lg border px-5 py-4 transition hover:shadow-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="font-mono text-base font-semibold"
                  style={{ color: 'var(--seazone-blue)' }}
                >
                  /{code}
                </span>
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  style={{ color: '#FF6B5B' }}
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
