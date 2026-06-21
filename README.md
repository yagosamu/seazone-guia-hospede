# Seazone · Guia Digital do Hóspede

Guia digital personalizado por imóvel, com curadoria local gerada por IA e assistente conversacional anti-alucinação. Construído como teste técnico AI Builder para a Seazone.

**Live demo:** https://seazone-guia-hospede-rho.vercel.app
**Repo:** https://github.com/yagosamu/seazone-guia-hospede

Acesse `/FLN001`, `/GRM001`, `/BAL001` ou `/RJ001` para ver imóveis de exemplo.

---

## O problema

A Seazone gerencia mais de 3.000 imóveis no Brasil. O guia atual do hóspede é estático e idêntico para todos: um folheto digital genérico. O hóspede em Gramado vê as mesmas informações do hóspede em Florianópolis. Cada imóvel deveria ter um guia próprio, com dados específicos (WiFi, regras, contato) e curadoria contextual da região (restaurantes reais, atrações, dicas sazonais).

## A solução

URL única por imóvel (`/FLN001`) com três camadas:

1. **Visualização estática**: dados do imóvel renderizados via Server Components diretamente do Postgres.
2. **Guia de Experiências gerado por IA**: agente Claude com tool calling a Tavily descobre lugares reais da região, sintetiza e persiste no banco (cache 30 dias).
3. **Assistente virtual streaming**: chat com Claude que responde sobre o imóvel usando apenas dados do contexto, com regras anti-alucinação explícitas.

---

## Quick start

```bash
git clone https://github.com/yagosamu/seazone-guia-hospede
cd seazone-guia-hospede
cp .env.example .env.local        # preencha DATABASE_URL, ANTHROPIC_API_KEY, TAVILY_API_KEY
npm install
npm run db:push                   # cria tabela properties no Postgres
npm run db:seed                   # popula 4 imóveis (FLN001, GRM001, BAL001, RJ001)
npm run dev                       # http://localhost:3000/FLN001
```

Variáveis de ambiente esperadas:

| Variável | De onde tirar |
|---|---|
| `DATABASE_URL` | Render Postgres → Connect → External URL (com `?sslmode=require`) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `TAVILY_API_KEY` | tavily.com → Dashboard (free tier 1k searches/mês) |

---

## Arquitetura

```
┌────────────────────────────────────────────────────────────────────┐
│                          BROWSER                                    │
│  ┌────────────────────────┐    ┌────────────────────────────────┐  │
│  │ /[code] page (RSC)     │    │ ChatWidget (client)            │  │
│  │ - Hero + welcome IA    │    │ - useChat → /api/chat          │  │
│  │ - Numbered sections    │    │ - Quick suggestions            │  │
│  │ - NeighborhoodLoader   │    │ - Smooth streaming             │  │
│  │   (triggers /api/...)  │    └────────────────┬───────────────┘  │
│  └────────────┬───────────┘                     │                  │
└───────────────┼─────────────────────────────────┼──────────────────┘
                │                                 │
                ▼                                 ▼
┌────────────────────────────┐   ┌──────────────────────────────────┐
│ /api/generate-guide        │   │ /api/chat                        │
│ ────────────────────────── │   │ ──────────────────────────────── │
│ 1. Get property + cache    │   │ 1. Get property + guide          │
│ 2. Tavily prefetch (3x ‖)  │   │ 2. Build system prompt           │
│ 3. Anthropic agentic loop  │   │    - Property data               │
│    - tavily_search tool    │   │    - Guide context               │
│    - submit_guide tool     │   │    - Anti-hallucination rules    │
│ 4. Zod validate            │   │    - 4 few-shot do PDF           │
│ 5. Save in DB cache        │   │ 3. streamText + smoothStream     │
└─────────┬──────────────────┘   └──────────┬───────────────────────┘
          │                                 │
          ▼                                 ▼
   ┌──────────────┐                  ┌──────────────┐
   │ Anthropic    │                  │ Anthropic    │
   │ Sonnet 4.6   │                  │ Sonnet 4.6   │
   └──────────────┘                  └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Tavily API   │
   └──────────────┘
                                ┌────────────────────────────────────┐
        ┌───────────────────────│ Postgres (Render)                  │
        │                       │ ──────────────────────────────────│
        │ Drizzle ORM           │ properties (code PK)               │
        │ ─────────────────     │   - address/operational/rules/...  │
        │ getPropertyByCode     │     (JSONB tipado por Zod)         │
        │ saveExperiencesGuide  │   - experiences_guide (JSONB, cache)│
        └───────────────────────▶                                    │
                                └────────────────────────────────────┘
```

**Princípio orientador**: server-first. Páginas renderizam no servidor com dados do DB (zero state client). UI cliente só pra streaming (chat) e fetch on-demand (loader do guide). Zero exposição de credenciais.

---

## Stack & why it matters

| Camada | Escolha | Por quê |
|---|---|---|
| **Framework** | Next.js 16 App Router | Server Components reduzem JS no client, streaming nativo de RSC, route handlers compactos pra API. |
| **Linguagem** | TypeScript strict + `noUncheckedIndexedAccess` | Type safety end-to-end. Zod types derivados (`z.infer<typeof X>`) reaproveitados no Drizzle (`jsonb.$type<X>()`). |
| **DB** | Postgres (Render) + Drizzle ORM | Drizzle é leve (sem runtime overhead), gera SQL transparente, e o `.$type<X>()` permite JSONB fortemente tipado sem normalizar tudo em colunas. |
| **Validação** | Zod | Single source of truth: schemas Zod definem JSONBs do DB **e** validam input/output das APIs. |
| **LLM** | Anthropic Claude Sonnet 4.6 | Melhor qualidade de instruction-following pra anti-hallucination + tool calling robusto. |
| **Streaming UI** | Vercel AI SDK 6 (`useChat` + `streamText` + `smoothStream`) | SSE out-of-the-box, hook React idiomático, `smoothStream` torna streaming visível e natural. |
| **Search** | Tavily API | Retorna conteúdo já textualizado (não JSON de Places API). LLM curaror trabalha melhor com texto cru. Free tier suficiente pra demo. |
| **UI** | Tailwind v4 + shadcn/ui + lucide-react | Tailwind v4 com `@theme inline` permite tokens semânticos (azul/coral Seazone). shadcn copia componentes pro repo, sem fork. |
| **Tipografia** | Manrope (display+body) + JetBrains Mono (códigos) | Manrope tem personalidade sem cair em "AI aesthetics" genérico (Inter). JetBrains Mono pra códigos WiFi/lock. |
| **Tests** | Vitest + @testing-library | Vitest tem startup rápido, compatível com TS sem config extra, integra com Vite (testes < 2s). |

---

## Features

### 1. Visualização do guia (`/[code]`)

Server Component que lê o imóvel via Drizzle direto do Postgres. Layout segue Atomic Design (atoms / molecules / organisms). Hero fullbleed com vinheta natural na foto (garante legibilidade em qualquer imagem). Bandas alternadas (paper / azul-claríssimo) criam ritmo visual. Estado 404 amigável para códigos inexistentes.

### 2. Guia de Experiências com IA (`/api/generate-guide`)

Endpoint POST que dispara um **agente Claude com tool calling**. Fluxo:

1. **Pre-fetch otimizado**: 3 buscas Tavily paralelas (restaurantes / atrações / essenciais) viram contexto inicial.
2. **Loop agêntico** (até 8 iterações): Claude recebe duas tools — `tavily_search` (para complementar com info específica) e `submit_guide` (entrega final estruturada). Tipicamente conclui em 2 iterações, com 1-2 buscas complementares quando necessário.
3. **Validação defensiva**: input do `submit_guide` revalidado com Zod (schema enforcement do Anthropic + validação extra).
4. **Persistência**: salva em `properties.experiences_guide` (JSONB) com timestamp. Cache TTL 30 dias. Param `force: true` regenera.
5. **Erros tipados**: `TavilyError` / `AnthropicError` / `ValidationError` / `MaxIterationsError` mapeados em status HTTP corretos (502/504).

Resultado: para FLN001 (Floripa), o guide tem Moochacho Burritos, Le Pario, Praia da Joaquina, HU/UFSC etc. Todos reais e contextualizados. Não há nomes inventados.

### 3. Assistente Virtual (chat) (`/api/chat` + `ChatWidget`)

Chat com streaming token-a-token (`smoothStream` 18ms por palavra) e regras anti-alucinação rígidas no system prompt:

- Responde com base nos dados do imóvel + guide. Nunca inventa nomes de lugares fora do contexto.
- Pode **caracterizar** lugares do guide com conhecimento geral (ex: "Joaquina é mais voltada para surf"), mas não inventar novos.
- Quando pergunta exige personalização que o contexto não cobre, redireciona elegantemente para o anfitrião.
- Pergunta totalmente fora de escopo: resposta literal de redirect ("Não tenho essa informação sobre este imóvel...").

UI: floating launcher (FAB coral) + drawer right (desktop) ou fullscreen (mobile). Quick suggestions cobrem as 4 perguntas-modelo do PDF (WiFi, pet, check-in, restaurantes). Estados completos: loading dots, streaming visível, error inline com retry.

---

## Compliance com requisitos

Mapeamento explícito de cada validação do briefing (PDF Seazone) e como atendemos.

### Funcionais

| Requisito | Como atendemos | Onde |
|---|---|---|
| URL única por imóvel (ex: `/FLN001`) | Rota dinâmica `/[code]` server-rendered, lê do Postgres | [`app/[code]/page.tsx`](app/%5Bcode%5D/page.tsx) |
| Erro amigável em código inexistente | Componente `not-found.tsx` customizado disparado por `notFound()` | [`app/[code]/not-found.tsx`](app/%5Bcode%5D/not-found.tsx) |
| Responsivo mobile + desktop | Tailwind mobile-first, breakpoints `md:` e `lg:`, carrossel com swipe | Toda a UI |
| Fotos do imóvel | Carrossel no hero com autoplay, setas, dots, swipe, pause on hover | [`components/organisms/PropertyHero.tsx`](components/organisms/PropertyHero.tsx) |
| Dados do imóvel (tipo, capacidade, amenidades) | Seção 01 "Sobre o imóvel" com grid de stats inline + chips de comodidades em ordem padronizada | [`components/organisms/PropertyOverview.tsx`](components/organisms/PropertyOverview.tsx) |
| Info de acesso (WiFi, smart lock, estacionamento) | Seção 02 com WiFi card destacado em coral, botão copiar senha, render condicional de estacionamento | [`components/organisms/AccessSection.tsx`](components/organisms/AccessSection.tsx) |
| Regras (check-in/out, pet, fumar, crianças, eventos) | Seção 03 com badges semânticos (teal permitido / coral negado) e copy humano por contexto | [`components/organisms/RulesSection.tsx`](components/organisms/RulesSection.tsx) |
| Contato (nome + telefone do anfitrião, endereço) | Seção 05 com avatar de iniciais, botão WhatsApp formatado, link Google Maps do endereço | [`components/organisms/ContactSection.tsx`](components/organisms/ContactSection.tsx) |
| Guia de Experiências contextualizado pelo endereço real | Agente Claude com tool calling Tavily descobre lugares reais da região + welcome separado | [`lib/experiences/generate.ts`](lib/experiences/generate.ts), [`lib/welcome/generate.ts`](lib/welcome/generate.ts) |
| **Guia persistido — não regenerado a cada acesso** | Colunas `experiences_guide` JSONB + `experiences_generated_at` em `properties`. Cache TTL 30 dias. Cache hit em <50ms (latência DB) | [`db/schema.ts`](db/schema.ts), [`app/api/generate-guide/route.ts`](app/api/generate-guide/route.ts) |
| **Feedback visual claro durante geração** | `WelcomeLoader` e `NeighborhoodLoader` com spinner, mensagens em estágios temporais ("Personalizando" → "Curando recomendações" → "Finalizando"), skeleton estruturado | [`components/organisms/WelcomeLoader.tsx`](components/organisms/WelcomeLoader.tsx), [`components/organisms/NeighborhoodLoader.tsx`](components/organisms/NeighborhoodLoader.tsx) |
| Chat em tempo real (streaming) | Vercel AI SDK `streamText` + `smoothStream` (18ms por palavra), texto chega progressivo | [`app/api/chat/route.ts`](app/api/chat/route.ts) |
| Chat com contexto do imóvel + guide | `buildSystemPrompt` injeta todos os dados do imóvel + guia + welcome + 4 few-shot examples do PDF | [`lib/chat/prompt.ts`](lib/chat/prompt.ts) |
| **Chat não inventa informações** | Regras anti-hallucination explícitas no system prompt + temperature 0.3 + redirect para anfitrião quando contexto não cobre | [`lib/chat/prompt.ts`](lib/chat/prompt.ts) |
| 4 perguntas oficiais respondidas corretamente | Tests cobrem WiFi/pet/check-in/restaurantes contra fixtures FLN001 e GRM001 do PDF | [`tests/unit/lib/chat/prompt.test.ts`](tests/unit/lib/chat/prompt.test.ts) |

### Técnicos

| Requisito | Como atendemos |
|---|---|
| Next.js | Next 16 (App Router) com Server Components |
| TypeScript | strict mode + `noUncheckedIndexedAccess` + `noImplicitOverride` |
| Tailwind CSS | v4 com `@theme inline` e tokens semânticos (paleta Seazone azul + coral) |
| Banco de dados | Postgres no Render, Drizzle ORM, schema com JSONB tipado via Zod |
| Uso de IA (LLM) | Claude Sonnet 4.6 (Anthropic) com tool calling para geração e streaming para chat |
| Atomic Design | Estrutura `atoms/` (SectionHeader, CopyButton, PlaceTypeBadge) → `molecules/` (AmenityChip, PlaceCard) → `organisms/` (Hero, sections, Chat) |
| Padrões de commits | Conventional Commits para mudanças estruturais (`feat(api):`, `feat(db):`, `chore:`, `test:`, `redesign:`) e descritivos curtos para polish visual. Histórico mostra a progressão em fases |
| Testes (diferencial) | 35 testes Vitest em 10 arquivos cobrindo schemas, helpers, queries, prompts (anti-hallucination) e route handlers |

---

## Decisões técnicas e trade-offs

**Drizzle vs Prisma**
Drizzle ganhou pela leveza (sem runtime client), SQL transparente e suporte excelente a JSONB tipado via `.$type<X>()`. Prisma é mais ergonômico em apps tradicionais mas adiciona overhead de runtime + binding generation que não justifica no escopo.

**Tavily vs Google Places API**
Tavily retorna conteúdo já textualizado (descrição de páginas, snippets) que o LLM consome diretamente. Places API exige acoplar geocoding + place_id + chamadas separadas pra reviews. Pra curadoria via LLM (que precisa de contexto narrativo), Tavily é mais ergonômico. Trade-off: Places teria coordenadas precisas; Tavily depende de estimativa do LLM pra distâncias (mitigado por instrução clara no prompt).

**Full agentic vs JSON puro (generate-guide)**
Considerei: (a) JSON puro com retry, (b) tool calling só para o output, (c) full agentic com `tavily_search` + `submit_guide`. Optei por (c) porque demonstra design agêntico real (Claude decide se precisa buscar mais) e o tool calling enforça o schema de saída no nível do SDK. O pre-fetch evita o custo de Claude descobrir buscas básicas do zero, e o limite de 8 iterações previne loop infinito. Resultado prático: 2 iterações, 1-2 buscas complementares, ~45s na primeira geração e cache hit subsequente.

**Cache no DB vs Redis**
Cache em coluna JSONB do próprio Postgres elimina dependência extra. TTL controlado por `experiences_generated_at`. Para escala (milhares de leituras/min), Redis valeria; nesse escopo, simplicidade > microsegundos.

**Anti-hallucination via prompt vs RAG vs fine-tuning**
Optei por prompt engineering com regras explícitas + few-shot examples baseados nas respostas-modelo do PDF + temperature 0.3. RAG genuíno (vector store) seria overkill para um contexto pequeno e estático (dados de 1 imóvel cabem em ~1k tokens). Fine-tuning fora de escopo.

**Tool calling no chat: descartado**
Avaliei ferramentas tipo "consultar disponibilidade" ou "calcular distância", mas decidi manter o chat puro de texto: o contexto já é suficiente, e tool calling adicionaria complexidade sem ganho funcional pro escopo.

**Single chat endpoint vs sessões persistidas**
Sem persistência de conversa (chat reseta ao fechar). Para o caso de uso (perguntas pontuais de um hóspede em estadia), isso é adequado. Persistir conversas seria fácil (uma tabela `chat_messages` + Drizzle), mas adicionaria escopo de moderação, exclusão LGPD, etc.

---

## Anti-hallucination strategy

Cinco camadas defensivas:

1. **System prompt rígido** com regras numeradas (`lib/chat/prompt.ts`): "Nunca invente nomes de lugares", "Quando não souber, redirecione para o anfitrião".
2. **Few-shot examples** dinâmicos: 4 exemplos baseados nas perguntas oficiais do PDF, gerados com os dados reais do imóvel atual (`SeaHome_FLN001` / `floripa2024` etc.).
3. **Temperature 0.3** (baixa criatividade, alta aderência ao prompt).
4. **Contexto verboso**: o system prompt injeta todos os dados do imóvel + guide em formato estruturado, eliminando ambiguidade.
5. **Diretriz de personalização honesta**: quando contexto é insuficiente, instruir Claude a reconhecer a limitação em vez de inventar uma resposta "criativa".

Validação manual cobre os 4 cenários do PDF (WiFi exato, pet por imóvel, check-in literal, restaurantes do guide) + edge cases (pergunta totalmente fora de escopo, perfil específico de hóspede).

---

## Testes

```bash
npm test
```

35 testes em 10 arquivos cobrindo:

- **Schemas Zod** (`tests/unit/schemas/`): boundaries das validações de Property e ExperiencesGuide.
- **Helpers** (`tests/unit/lib/`): `formatAddress`, `whatsappUrl`, `googleMapsUrl`, `getAmenity` fallback, classes de erro.
- **buildSystemPrompt do chat** (`tests/unit/lib/chat/`): presença de regras anti-hallucination, dados do imóvel injetados corretamente, diferenciação por imóvel (FLN sem pet vs GRM com pet).
- **Queries DB** (`tests/unit/db/queries.test.ts`): normalização de código (uppercase, trim), null case.
- **Route handlers** (`tests/integration/api/`): generate-guide com mock de Anthropic/Tavily (404, cache hit, force regenerate, body inválido). Chat com mock de streamText (404, 400, prompt building correto).

Mocks somente nas boundaries externas (Drizzle pool, Anthropic SDK, Tavily fetch). Schemas, helpers e prompts rodam com implementação real. Nenhum teste chama API externa — toda a suíte roda offline.

---

## Estrutura de pastas

```
app/
  [code]/page.tsx              ← server component, fetch property + render
  [code]/not-found.tsx         ← 404 customizado
  [code]/loading.tsx           ← skeleton
  api/generate-guide/route.ts  ← POST agentic
  api/chat/route.ts            ← POST streaming
  globals.css                  ← tema Seazone (paleta, fonts)
  layout.tsx                   ← Manrope + JetBrains Mono via next/font

components/
  atoms/                       ← primitivos puros (SectionHeader, PlaceTypeBadge, CopyButton)
  molecules/                   ← compostos (AmenityChip, PlaceCard)
  organisms/                   ← seções completas (Hero, Overview, Access, Rules, Contact,
                                 NeighborhoodSection, NeighborhoodLoader, ChatWidget)
  ui/                          ← shadcn (button, card, badge, skeleton, input)

db/
  schema.ts                    ← tabela properties (Drizzle)
  client.ts                    ← pool singleton + SSL pra Render
  queries.ts                   ← getPropertyByCode + saveExperiencesGuide
  seed.ts                      ← delete+insert idempotente
  schemas/property.ts          ← Zod: Address, Operational, Rules, Amenities, Host
  schemas/experiences.ts       ← Zod: Restaurant, Attraction, Essential, ExperiencesGuide
  fixtures/{fln001,grm001,bal001,rj001}.ts  ← dados literais (FLN/GRM do PDF, BAL/RJ próprios)
  migrations/                  ← SQL gerado por drizzle-kit

lib/
  anthropic.ts                 ← cliente Anthropic singleton
  tavily.ts                    ← fetch wrapper com timeout
  experiences/                 ← geração agêntica (tools, prompts, errors, generate)
  chat/                        ← context loader + system prompt builder
  amenities.ts                 ← mapping amenity key → label + ícone lucide
  format.ts                    ← formatAddress, whatsappUrl, googleMapsUrl
  utils.ts                     ← cn helper do shadcn

tests/
  unit/                        ← schemas, helpers, prompts, queries
  integration/                 ← route handlers com mocks
```


