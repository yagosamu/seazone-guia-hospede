import type { ReactNode } from 'react'

type PlaceCardProps = {
  index: number
  name: string
  distance: string
  description: string
  badge?: ReactNode
}

export function PlaceCard({ index, name, distance, description, badge }: PlaceCardProps) {
  return (
    <article className="border-border bg-card hover:border-foreground/20 group relative rounded-xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-sm md:p-6">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span
          className="nums-tabular text-xs font-bold tracking-[0.08em]"
          style={{ color: 'var(--seazone-coral)' }}
        >
          {String(index).padStart(2, '0')}
        </span>
        {badge ?? null}
      </div>
      <h4 className="text-foreground mb-1 text-[15px] leading-snug font-semibold tracking-tight">
        {name}
      </h4>
      <p
        className="mb-2 text-[11px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: 'var(--seazone-blue)' }}
      >
        {distance}
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </article>
  )
}
