import type { Property } from '@/db/schema'
import { YesNoIcon } from '@/components/atoms/YesNoIcon'

type RulesSectionProps = {
  property: Property
}

export function RulesSection({ property }: RulesSectionProps) {
  const { rules } = property

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold md:text-2xl">Regras da casa</h2>
        <p className="mt-1 text-muted-foreground">Check-in a partir de {rules.check_in_time} e check-out até {rules.check_out_time}.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <YesNoIcon label="Permite pets" value={rules.allow_pet} />
        <YesNoIcon label="Permite fumar" value={rules.smoking_permitted} />
        <YesNoIcon label="Adequado para crianças" value={rules.suitable_for_children} />
        <YesNoIcon label="Adequado para bebês" value={rules.suitable_for_babies} />
        <YesNoIcon label="Eventos permitidos" value={rules.events_permitted} />
      </div>
    </section>
  )
}
