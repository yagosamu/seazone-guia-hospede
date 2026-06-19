import { Check, X } from 'lucide-react'
import type { Property } from '@/db/schema'
import { SectionHeader } from '@/components/atoms/SectionHeader'

type RulesSectionProps = {
  property: Property
}

type Rule = {
  label: { positive: string; negative: string }
  value: boolean
}

export function RulesSection({ property }: RulesSectionProps) {
  const { rules } = property

  const items: Rule[] = [
    {
      label: { positive: 'Crianças bem-vindas', negative: 'Não adequado para crianças' },
      value: rules.suitable_for_children,
    },
    {
      label: { positive: 'Bebês acomodados', negative: 'Não adequado para bebês' },
      value: rules.suitable_for_babies,
    },
    {
      label: { positive: 'Pets permitidos', negative: 'Animais não permitidos' },
      value: rules.allow_pet,
    },
    {
      label: { positive: 'Fumar permitido', negative: 'Não é permitido fumar' },
      value: rules.smoking_permitted,
    },
    {
      label: { positive: 'Eventos permitidos', negative: 'Eventos não permitidos' },
      value: rules.events_permitted,
    },
  ]

  return (
    <section className="space-y-7">
      <SectionHeader
        number="03"
        eyebrow="Regras da estadia"
        title="O que você pode esperar deste imóvel"
        description={`Check-in a partir das ${rules.check_in_time} e check-out até as ${rules.check_out_time}.`}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <RuleItem key={item.label.positive} rule={item} />
        ))}
      </div>
    </section>
  )
}

function RuleItem({ rule }: { rule: Rule }) {
  const label = rule.value ? rule.label.positive : rule.label.negative
  const Icon = rule.value ? Check : X
  const accentColor = rule.value ? 'var(--color-success)' : '#FF6B5B'
  const bgTint = rule.value ? 'rgba(15,118,110,0.06)' : 'rgba(255,107,91,0.07)'

  return (
    <div
      className="flex items-center gap-3 rounded-r-md py-3 pr-4 pl-4 text-sm"
      style={{ background: bgTint, borderLeft: `2px solid ${accentColor}` }}
    >
      <Icon
        className="h-4 w-4 shrink-0"
        style={{ color: accentColor }}
        aria-hidden="true"
      />
      <span className="text-foreground font-medium">{label}</span>
    </div>
  )
}
