type SectionHeaderProps = {
  number: string
  eyebrow: string
  title: string
  description?: string
}

export function SectionHeader({ number, eyebrow, title, description }: SectionHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[var(--seazone-coral)] nums-tabular text-sm font-bold tracking-wide">
          {number}
        </span>
        <span className="h-px w-7 bg-[var(--seazone-coral)]" aria-hidden="true" />
        <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.2em] uppercase">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight md:text-[28px]">
        {title}
      </h2>
      {description ? (
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  )
}
