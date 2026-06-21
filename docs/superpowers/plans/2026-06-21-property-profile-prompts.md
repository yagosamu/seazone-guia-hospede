# Property Profile Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Derive property profiles from existing data and use them as safe, anti-hallucination curation priorities in guide generation and chat prompts.

**Architecture:** A new pure module resolves ordered profile tags from property city and amenities, and formats a shared Portuguese instruction block. Both prompt builders consume that block, leaving database schemas, fixtures, external APIs and route contracts unchanged. The profile only prioritizes existing evidence; it never introduces facts or locations.

**Tech Stack:** TypeScript, Vitest, Zod-derived Drizzle `Property` types, Anthropic prompt builders.

---

## File structure

- Create `lib/property-profiles.ts`: profile type, deterministic resolver and prompt directives.
- Create `tests/unit/lib/property-profiles.test.ts`: fixture resolution and fallback behavior.
- Modify `lib/experiences/prompts.ts`: add profile directives to the guide-generation user message.
- Modify `lib/chat/prompt.ts`: add a compact profile directive to the chat system prompt.
- Modify `tests/unit/lib/experiences/prompts.test.ts`: assert guide prompt injection.
- Modify `tests/unit/lib/chat/prompt.test.ts`: assert chat prompt injection.

### Task 1: Resolve property profiles

**Files:**
- Create: `lib/property-profiles.ts`
- Create: `tests/unit/lib/property-profiles.test.ts`

- [ ] **Step 1: Write the failing resolver tests**

```ts
import { describe, expect, it } from 'vitest'
import { FLN001 } from '@/db/fixtures/fln001'
import { GRM001 } from '@/db/fixtures/grm001'
import { BAL001 } from '@/db/fixtures/bal001'
import { RJ001 } from '@/db/fixtures/rj001'
import { resolvePropertyProfiles } from '@/lib/property-profiles'

describe('resolvePropertyProfiles', () => {
  it('derives expected profiles from the four fixtures', () => {
    expect(resolvePropertyProfiles(FLN001)).toEqual(['coastal'])
    expect(resolvePropertyProfiles(GRM001)).toEqual(['mountain'])
    expect(resolvePropertyProfiles(BAL001)).toEqual(['coastal', 'urban'])
    expect(resolvePropertyProfiles(RJ001)).toEqual(['coastal', 'urban'])
  })

  it('uses rural as the deterministic fallback', () => {
    expect(resolvePropertyProfiles({ ...FLN001, address: { ...FLN001.address, city: 'Interior' }, amenities: {} })).toEqual(['rural'])
  })
})
```

- [ ] **Step 2: Run the resolver tests and confirm failure**

Run: `npm test -- tests/unit/lib/property-profiles.test.ts`

Expected: FAIL because `@/lib/property-profiles` does not exist.

- [ ] **Step 3: Implement the pure resolver and shared directive builder**

```ts
import type { Property } from '@/db/schema'

export const PROPERTY_PROFILES = ['coastal', 'mountain', 'urban', 'rural'] as const
export type PropertyProfile = (typeof PROPERTY_PROFILES)[number]

const COASTAL_CITIES = new Set(['Florianópolis', 'Balneário Camboriú', 'Rio de Janeiro'])
const MOUNTAIN_CITIES = new Set(['Gramado'])
const URBAN_CITIES = new Set(['Balneário Camboriú', 'Rio de Janeiro'])

export function resolvePropertyProfiles(property: Pick<Property, 'address' | 'amenities'>): PropertyProfile[] {
  const profiles: PropertyProfile[] = []
  const { city } = property.address
  const amenities = property.amenities
  if (COASTAL_CITIES.has(city) || amenities.beachfront || amenities.near_beach || amenities.sea_view) profiles.push('coastal')
  if (MOUNTAIN_CITIES.has(city) || amenities.mountain_view || amenities.heater || amenities.fireplace) profiles.push('mountain')
  if (URBAN_CITIES.has(city) || amenities.doorman_24h) profiles.push('urban')
  return profiles.length ? profiles : ['rural']
}

export function buildProfileGuidance(profiles: PropertyProfile[], mode: 'guide' | 'chat'): string {
  const directives: Record<PropertyProfile, string> = {
    coastal: 'Priorize praias, orla, restaurantes litorâneos e serviços úteis após um dia de praia, quando esses itens estiverem nos resultados.',
    mountain: 'Priorize gastronomia, mirantes, passeios internos e opções adequadas para dias frios ou chuvosos, quando esses itens estiverem nos resultados.',
    urban: 'Priorize mobilidade, cultura, restaurantes e serviços essenciais com deslocamento simples, quando esses itens estiverem nos resultados.',
    rural: 'Priorize chegada, abastecimento, natureza e planejamento prévio, quando esses itens estiverem nos resultados.',
  }
  const common = mode === 'guide'
    ? 'Os perfis são uma lente de prioridade para selecionar e contextualizar informações existentes. Eles não são fonte de fatos novos. Recomende somente locais presentes nos resultados de busca. Não afirme clima, maré, trânsito, segurança, disponibilidade, horários, acessibilidade ou condições de estrada sem evidência explícita.'
    : 'Use os perfis apenas para priorizar respostas compatíveis com a experiência do imóvel. Não apresente o perfil como fato ao hóspede, não invente locais ou condições locais e preserve as regras anti-alucinação.'
  return `PERFIS ATIVOS DESTE IMÓVEL: ${profiles.join(', ')}\n${common}\n${profiles.map((profile) => `${profile.toUpperCase()}: ${directives[profile]}`).join('\n')}`
}
```

- [ ] **Step 4: Run the resolver tests and confirm success**

Run: `npm test -- tests/unit/lib/property-profiles.test.ts`

Expected: PASS with two tests.

- [ ] **Step 5: Commit the resolver**

```bash
git add lib/property-profiles.ts tests/unit/lib/property-profiles.test.ts
git commit -m "feat(ai): derive property profiles for curation"
```

### Task 2: Inject profiles into guide generation

**Files:**
- Modify: `lib/experiences/prompts.ts`
- Modify: `tests/unit/lib/experiences/prompts.test.ts`

- [ ] **Step 1: Write the failing guide prompt assertion**

```ts
it('includes coastal profile guidance for FLN001', () => {
  const prompt = buildInitialUserMessage({ property, restaurantsResults: search, attractionsResults: search, essentialsResults: search, currentMonth: 'junho' })
  expect(prompt).toContain('PERFIS ATIVOS DESTE IMÓVEL: coastal')
  expect(prompt).toContain('não são fonte de fatos novos')
})
```

- [ ] **Step 2: Run the guide prompt test and confirm failure**

Run: `npm test -- tests/unit/lib/experiences/prompts.test.ts`

Expected: FAIL because the generated user message lacks profile guidance.

- [ ] **Step 3: Add the directive to `buildInitialUserMessage`**

```ts
import { buildProfileGuidance, resolvePropertyProfiles } from '@/lib/property-profiles'

const profiles = resolvePropertyProfiles(property)
const profileGuidance = buildProfileGuidance(profiles, 'guide')

return `IMÓVEL
Nome: ${property.name}

${profileGuidance}

BUSCAS INICIAIS PRÉ-FEITAS:
${formatResults(restaurantsResults)}`
```

- [ ] **Step 4: Run the guide prompt test and confirm success**

Run: `npm test -- tests/unit/lib/experiences/prompts.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the guide prompt integration**

```bash
git add lib/experiences/prompts.ts tests/unit/lib/experiences/prompts.test.ts
git commit -m "feat(ai): tailor guide curation by property profile"
```

### Task 3: Inject profiles into chat

**Files:**
- Modify: `lib/chat/prompt.ts`
- Modify: `tests/unit/lib/chat/prompt.test.ts`

- [ ] **Step 1: Write the failing chat prompt assertion**

```ts
it('uses property profiles as a safe chat preference', () => {
  const prompt = buildSystemPrompt({ property: propertyFromFixture(GRM001), guide: null })
  expect(prompt).toContain('Perfis ativos deste imóvel: mountain')
  expect(prompt).toContain('não apresente o perfil como fato ao hóspede')
})
```

- [ ] **Step 2: Run the chat prompt test and confirm failure**

Run: `npm test -- tests/unit/lib/chat/prompt.test.ts`

Expected: FAIL because the system prompt lacks profile guidance.

- [ ] **Step 3: Add compact chat guidance after the absolute rules**

```ts
import { buildProfileGuidance, resolvePropertyProfiles } from '@/lib/property-profiles'

const profileGuidance = buildProfileGuidance(resolvePropertyProfiles(property), 'chat')

return `RESPOND IN: ${language}
Você é o assistente virtual do guia digital Seazone.

${profileGuidance}

DADOS DO IMÓVEL
Código: ${property.code}`
```

- [ ] **Step 4: Run the chat prompt test and confirm success**

Run: `npm test -- tests/unit/lib/chat/prompt.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the chat prompt integration**

```bash
git add lib/chat/prompt.ts tests/unit/lib/chat/prompt.test.ts
git commit -m "feat(ai): tailor chat context by property profile"
```

### Task 4: Verify the complete change

**Files:**
- No additional source files.

- [ ] **Step 1: Run TypeScript validation**

Run: `npx tsc --noEmit`

Expected: exit code 0.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`

Expected: all test files and tests pass.

- [ ] **Step 3: Build the application**

Run: `npm run build`

Expected: Next.js reports a successful compilation and route generation.

- [ ] **Step 4: Review the scoped diff and commit the completed feature if tasks were squashed**

```bash
git diff --check
git status --short
git log --oneline -5
```

Expected: no whitespace errors in files changed by this feature, and no unrelated files staged.
