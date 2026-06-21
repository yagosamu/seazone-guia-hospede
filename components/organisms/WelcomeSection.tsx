import { Sparkles } from 'lucide-react'

type WelcomeSectionProps = {
  message: string
}

export function WelcomeSection({ message }: WelcomeSectionProps) {
  return (
    <section className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,107,91,0.12)' }}
      >
        <Sparkles className="h-5 w-5" style={{ color: '#FF6B5B' }} aria-hidden="true" />
      </div>
      <div className="space-y-3">
        <p
          className="text-[10px] font-semibold tracking-[0.22em] uppercase"
          style={{ color: '#FF6B5B' }}
        >
          Boas-vindas
        </p>
        <p className="text-foreground max-w-2xl text-base leading-relaxed md:text-lg md:leading-[1.65]">
          {message}
        </p>
      </div>
    </section>
  )
}
