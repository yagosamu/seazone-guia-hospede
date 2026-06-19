import { CheckCircle2, XCircle } from 'lucide-react'

type YesNoIconProps = {
  label: string
  value: boolean
}

export function YesNoIcon({ label, value }: YesNoIconProps) {
  const Icon = value ? CheckCircle2 : XCircle

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Icon
        className={`h-5 w-5 ${value ? 'text-emerald-600' : 'text-red-600'}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-auto text-xs text-muted-foreground">{value ? 'Sim' : 'Não'}</span>
    </div>
  )
}
