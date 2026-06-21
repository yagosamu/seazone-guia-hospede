# Seazone · Guia Digital do Hóspede

Guia digital personalizado por imóvel, com curadoria local gerada por IA e assistente conversacional anti-alucinação. Construído como teste técnico AI Builder para a Seazone.

**Live demo:** https://seazone-guia-hospede-rho.vercel.app

Acesse `/FLN001`, `/GRM001`, `/BAL001` ou `/RJ001` para ver imóveis de exemplo.

---

## Índice

- [O problema](#o-problema)
- [A solução](#a-solução)
- [Início rápido](#início-rápido)
- [Arquitetura](#arquitetura)
- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Compliance com requisitos](#compliance-com-requisitos)
- [Decisões técnicas e trade-offs](#decisões-técnicas-e-trade-offs)
- [Estratégia anti-alucinação](#estratégia-anti-alucinação)
- [Testes](#testes)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Sobre](#sobre)
- [Licença](#licença)

---

## O problema

A Seazone gerencia mais de 3.000 imóveis no Brasil. O guia atual do hóspede é estático e idêntico para todos: um folheto digital genérico. O hóspede em Gramado vê as mesmas informações do hóspede em Florianópolis. Cada imóvel deveria ter um guia próprio, com dados específicos (WiFi, regras, contato) e curadoria contextual da região (restaurantes reais, atrações, dicas sazonais).

## A solução

URL única por imóvel (`/FLN001`) com cinco camadas, **três direcionadas por IA**:

1. **Visualização estática**: dados do imóvel renderizados via Server Components direto do Postgres.
2. **Boas-vindas + Guia de Experiências gerados por IA**: dois endpoints, welcome rápido (~5s, sem Tavily) e guide completo via agente Claude com tool calling a Tavily (descobre lugares reais, ~45s). Ambos persistidos no banco (cache 30 dias). Curadoria é ajustada por **perfil do imóvel** (coastal/mountain/urban/rural) detectado automaticamente.
3. **Assistente virtual streaming** _(AI)_: chat com Claude que responde usando apenas o contexto do imóvel + guide, com regras anti-alucinação explícitas. Caracteriza lugares do guide com conhecimento geral, mas redireciona pro anfitrião quando contexto não cobre.
4. **Roteiro personalizado** _(AI)_: planner que monta itinerário day-by-day a partir de 5 preferências do hóspede (dias, perfil, vibe, locomoção, restrições). Guardrails de raio por transporte (`a pé` ≤ 1,5 km, `carro` ≤ 20 km), allowlist de ícones por cidade e validação de coerência pós-Zod garantem que a IA não invente lugares nem viole o raio escolhido.
5. **Multilíngue (PT/EN/ES)**: toggle no topo da página. UI traduzida, conteúdo gerado por IA é traduzido on-demand, e o chat responde no idioma escolhido com termos regionais naturais.

---

## Início rápido

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

## Stack 

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

## Funcionalidades

### 1. Visualização do guia (`/[code]`)

Server Component que lê o imóvel via Drizzle direto do Postgres. Layout segue Atomic Design (atoms / molecules / organisms). Hero fullbleed com vinheta natural na foto (garante legibilidade em qualquer imagem). Bandas alternadas (paper / azul-claríssimo) criam ritmo visual. Estado 404 amigável para códigos inexistentes.

### 2. Guia de Experiências com IA (`/api/generate-guide`)

Endpoint POST que dispara um **agente Claude com tool calling**. Fluxo:

1. **Pre-fetch otimizado**: 3 buscas Tavily paralelas (restaurantes / atrações / essenciais) viram contexto inicial.
2. **Loop agêntico** (até 8 iterações): Claude recebe duas tools, `tavily_search` (para complementar com info específica) e `submit_guide` (entrega final estruturada). Tipicamente conclui em 2 iterações, com 1-2 buscas complementares quando necessário.
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

### 4. Idiomas (PT / EN / ES)

Seletor de idioma com UI estática traduzida em 3 dicionários e tradução on-demand do conteúdo gerado por IA (welcome + descrições + dica sazonal via `/api/translate` com Claude). Place names e distâncias ficam em português (não traduzir "Praia da Joaquina"). O locale também viaja no body do `/api/chat`: o assistente responde em PT/EN/ES com termos regionais naturais, mantendo dados literais (rede WiFi, senha, código de acesso) intactos.

### 5. Roteiro personalizado por IA (`/api/itinerary` + `/api/itinerary/refine`)

Modal estilo Seazone com 5 perguntas (dias, quem viaja, vibe, locomoção, restrições opcionais). Submit → Claude com `submit_itinerary` tool calling → roteiro day-by-day estruturado (manhã/tarde/noite), exibido em cards com **duração estimada** e **distância do imóvel** por atividade. Inclui botão "Copiar texto" pra compartilhar via WhatsApp/notes e botão "Expandir" pra fullscreen no mobile.

**Refinement multi-turn**: após gerar, o hóspede pode ajustar via campo "Quer ajustar algo?" ("substitua o dia 2 por algo mais cultural", "remova o Snowland, criança tem medo de frio"). Backend recebe histórico + roteiro atual + novo pedido e retorna versão revisada. Limite de 5 refinements por sessão, validador de coerência reaplica todos os guardrails.

**Atalho no Chat**: o botão "Roteiro personalizado" também aparece no EmptyState do assistente virtual, dando dois caminhos pro mesmo modal (da seção Arredores ou do chat).

**Camadas de guardrail anti-alucinação** (o que torna a feature defensável):

1. **Allowlist de ícones por cidade**: `lib/itinerary/iconic-places.ts` lista lugares universalmente conhecidos (Cristo Redentor, Lago Negro, Praia da Joaquina) divididos em `cardinal` (sempre apropriados) + `byVibe` (filtrados pela escolha do hóspede). Fora dessa lista e do guide cacheado, Claude deve usar tipos genéricos ("café local", "trilha próxima").
2. **Validação de raio por transporte** pós-LLM: para `walk`, rejeita activities com distância > 1,5 km ou duração a pé > 20 min. Para `car`, rejeita > 20 km ou > 30 min. Roteiros que violam são retornados com erro 502 + mensagem específica pro client.
3. **Validação de coerência**: dias devem ser sequenciais (1..N) e bater com `request.days`. `from_guide: true` só é aceito se o lugar existe literalmente no guide cacheado.
4. **Profile-aware**: o perfil do imóvel (coastal/mountain/urban/rural) entra no prompt, sem sugerir programa de praia em Gramado nem de serra em Floripa.
5. **Não persiste**: roteiro é one-shot por sessão. Cada submit gera novo, sem armazenar. Refinements vivem só em estado React local.

### 6. Mobile UX - densidade controlada

Página `/[code]` no mobile reduz scroll com toggle "Mostrar mais" controlado por CSS-first (sem detecção JS de viewport):

- **Arredores**: cada subseção (Restaurantes / Atrações / Essenciais) mostra 2 cards por padrão + botão `Mostrar mais (N)`.
- **Comodidades**: 8 chips visíveis + botão `Ver todas (N)`.
- **Desktop (≥ md)**: tudo visível sempre, botão escondido via `md:hidden`.

Implementado com `hidden md:block` nos itens extras + `useState` local pra toggle. Sem `useMediaQuery` ou `window.innerWidth`, evita hydration mismatch.

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
| **Guia persistido, não regenerado a cada acesso** | Colunas `experiences_guide` JSONB + `experiences_generated_at` em `properties`. Cache TTL 30 dias. Cache hit em <50ms (latência DB) | [`db/schema.ts`](db/schema.ts), [`app/api/generate-guide/route.ts`](app/api/generate-guide/route.ts) |
| **Feedback visual claro durante geração** | `WelcomeLoader` e `NeighborhoodLoader` com spinner, mensagens em estágios temporais ("Personalizando" → "Curando recomendações" → "Finalizando"), skeleton estruturado | [`components/organisms/WelcomeLoader.tsx`](components/organisms/WelcomeLoader.tsx), [`components/organisms/NeighborhoodLoader.tsx`](components/organisms/NeighborhoodLoader.tsx) |
| Chat em tempo real (streaming) | Vercel AI SDK `streamText` + `smoothStream` (18ms por palavra), texto chega progressivo | [`app/api/chat/route.ts`](app/api/chat/route.ts) |
| Chat com contexto do imóvel + guide | `buildSystemPrompt` injeta todos os dados do imóvel + guia + welcome + 4 few-shot examples do PDF | [`lib/chat/prompt.ts`](lib/chat/prompt.ts) |
| **Chat não inventa informações** | Regras anti-hallucination explícitas no system prompt + temperature 0.3 + redirect para anfitrião quando contexto não cobre | [`lib/chat/prompt.ts`](lib/chat/prompt.ts) |
| 4 perguntas oficiais respondidas corretamente | Tests cobrem WiFi/pet/check-in/restaurantes contra fixtures FLN001 e GRM001 do PDF | [`tests/unit/lib/chat/prompt.test.ts`](tests/unit/lib/chat/prompt.test.ts) |
| **Diferencial: roteiro personalizado por IA** | Modal com 5 perguntas + Claude com `submit_itinerary` tool + multi-turn refinement + allowlist por cidade + validação de raio | [`app/api/itinerary/route.ts`](app/api/itinerary/route.ts), [`lib/itinerary/iconic-places.ts`](lib/itinerary/iconic-places.ts) |
| **Diferencial: multilíngue PT/EN/ES com IA-aware** | Toggle de idioma + dicionários + tradução on-demand de conteúdo gerado por Claude + chat responde no idioma | [`lib/i18n/`](lib/i18n), [`app/api/translate/route.ts`](app/api/translate/route.ts) |
| **Diferencial: variantes de prompt por perfil do imóvel** | Resolver determinístico (`coastal`/`mountain`/`urban`/`rural`) injeta diretrizes contextuais nos prompts de guide e chat | [`lib/property-profiles.ts`](lib/property-profiles.ts) |

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
| Testes (diferencial) | 47 testes Vitest em 13 arquivos cobrindo schemas, helpers, queries, prompts (anti-hallucination, idioma e perfil), guardrails do itinerary (allowlist + raio + coerência) e route handlers |

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

## Estratégia anti-alucinação

Estratégia em camadas, **calibrada por feature** (chat é mais rígido, itinerary é criativo mas com guardrails).

### Chat

1. **System prompt rígido** com regras numeradas (`lib/chat/prompt.ts`): "Nunca invente nomes de lugares", "Quando não souber, redirecione para o anfitrião".
2. **Few-shot examples** dinâmicos: 4 exemplos baseados nas perguntas oficiais do PDF, gerados com os dados reais do imóvel atual (`SeaHome_FLN001` / `floripa2024` etc.).
3. **Temperature 0.3** (baixa criatividade, alta aderência ao prompt).
4. **Contexto verboso**: system prompt injeta todos os dados do imóvel + guide em formato estruturado.
5. **Caracterização honesta**: Claude pode descrever perfil de lugares do guide (ex: "Joaquina é mais de surf") mas não pode inventar novos. Quando contexto insuficiente, reconhece limitação e redireciona.

### Guide generation (agente)

- **Tool calling enforça schema** no nível do SDK (não há "JSON quebrado").
- **Restrições de curadoria** no system prompt: cidade litorânea precisa ao menos uma praia famosa; não recomendar instituições puramente acadêmicas; sem clichês de IA.
- **Variantes por perfil**: prompt adicional baseado no profile resolver (`coastal`/`mountain`/`urban`/`rural`) prioriza recomendações sem autorizar inventar fatos.

### Itinerary planner (criativo, mas validado)

- **Allowlist de ícones por cidade** (`cardinal` + `byVibe`): Claude só pode mencionar nomes do guide cacheado ou dessa allowlist. Fora disso, tipos genéricos.
- **Validador heurístico pós-LLM**: para `transport=walk` rejeita distância > 1,5 km ou tempo > 20 min; para `car` rejeita > 20 km / > 30 min.
- **Validação de coerência**: dias sequenciais, `from_guide: true` referenciando lugar real do guide.
- **Profile-aware**: mesmo resolver do guide aplica restrições contextuais.
- **Refinement preserva guardrails**: o `/api/itinerary/refine` reaplica TODAS as validações no output revisado. Numeração 1..N, todos os dias presentes, `from_guide` consistente, raio respeitado.

### Itinerary refinement (multi-turn com memória)

- **Estado da conversa só no client**: roteiro + histórico de pedidos vivem em React state, não persistem.
- **Limite de 5 refinements por sessão**: prevê custos descontrolados; backend retorna 429 se excedido.
- **Histórico enviado ao modelo limitado a 4 entries recentes**: reduz overhead sem perder contexto útil.
- **Mensagens de erro user-friendly**: validações (Zod, coerência, raio) traduzem em texto humano no client, em vez de stack trace.

Validação manual cobre os 4 cenários oficiais do PDF (WiFi, pet, check-in, restaurantes) + redirecionamento honesto em personalização + raio respeitado em walk/car + refinement preservando dia 1 ao trocar dia 2.

---

## Testes

```bash
npm test
```

47 testes em 13 arquivos cobrindo:

- **Schemas Zod** (`tests/unit/schemas/`): boundaries das validações de Property, ExperiencesGuide e ItineraryRequest.
- **Helpers** (`tests/unit/lib/`): `formatAddress`, `whatsappUrl`, `googleMapsUrl`, `getAmenity` fallback, classes de erro.
- **buildSystemPrompt do chat** (`tests/unit/lib/chat/`): regras anti-hallucination, dados do imóvel injetados corretamente, diferenciação por imóvel (FLN sem pet vs GRM com pet), idioma de resposta selecionado (PT/EN/ES) e profile-aware.
- **Itinerary guardrails** (`tests/unit/lib/itinerary/`): allowlist de ícones por cidade + vibe, validação de raio por transporte (walk/car), coerência de dias sequenciais.
- **Queries DB** (`tests/unit/db/queries.test.ts`): normalização de código (uppercase, trim), null case.
- **Route handlers** (`tests/integration/api/`): generate-guide com mock de Anthropic/Tavily (404, cache hit, force regenerate, body inválido). Chat com mock de streamText. Itinerary com mock de Claude e validação completa do output.

Mocks somente nas boundaries externas (Drizzle pool, Anthropic SDK, Tavily fetch). Schemas, helpers e prompts rodam com implementação real. Nenhum teste chama API externa, toda a suíte roda offline.

---

## Estrutura de pastas

```
app/
  [code]/page.tsx              ← server component, fetch property + render
  [code]/not-found.tsx         ← 404 customizado i18n-aware
  [code]/loading.tsx           ← skeleton
  api/generate-welcome/route.ts ← POST welcome message rápido (~5s)
  api/generate-guide/route.ts  ← POST agentic (tool calling Tavily, ~45s)
  api/chat/route.ts            ← POST streaming chat
  api/itinerary/route.ts       ← POST roteiro personalizado com guardrails
  api/translate/route.ts       ← POST tradução on-demand de conteúdo gerado
  globals.css                  ← tema Seazone (paleta, fonts)
  layout.tsx                   ← Manrope + JetBrains Mono + I18nProvider

components/
  atoms/                       ← primitivos (SectionHeader, PlaceTypeBadge, CopyButton, LanguageSwitcher)
  molecules/                   ← compostos (AmenityChip, PlaceCard, ItineraryDayCard)
  organisms/                   ← seções completas (Hero, Overview, Access, Rules, Contact,
                                 NeighborhoodSection, NeighborhoodLoader, WelcomeSection,
                                 WelcomeLoader, ChatWidget, ItineraryTrigger, ItineraryModal,
                                 TranslatedWelcomeSection, TranslatedNeighborhoodSection)
  ui/                          ← shadcn (button, card, badge, skeleton, input)

db/
  schema.ts                    ← tabela properties (Drizzle) + welcome_message
  client.ts                    ← pool singleton + SSL pra Render
  queries.ts                   ← getPropertyByCode + saveExperiencesGuide + saveWelcomeMessage
  seed.ts                      ← delete+insert idempotente
  schemas/property.ts          ← Zod: Address, Operational, Rules, Amenities, Host
  schemas/experiences.ts       ← Zod: Restaurant, Attraction, Essential, ExperiencesGuide
  fixtures/{fln001,grm001,bal001,rj001}.ts  ← dados literais (FLN/GRM do PDF, BAL/RJ próprios)
  migrations/                  ← SQL gerado por drizzle-kit (incl. welcome_message column)

lib/
  anthropic.ts                 ← cliente Anthropic singleton
  tavily.ts                    ← fetch wrapper com timeout
  property-profiles.ts         ← resolver determinístico de perfil (coastal/mountain/urban/rural)
  welcome/                     ← geração de welcome message (~5s, sem Tavily)
  experiences/                 ← geração agêntica do guide (tools, prompts, errors, generate)
  chat/                        ← context loader + system prompt builder locale-aware
  itinerary/                   ← planner: types, schema, tool, prompt, allowlist, validação, generate
  i18n/                        ← provider, dicionários PT/EN/ES, cookies, hooks
  amenities.ts                 ← mapping amenity key → ícone lucide (label vem do dict)
  format.ts                    ← formatAddress, whatsappUrl, googleMapsUrl
  utils.ts                     ← cn helper do shadcn

tests/
  unit/                        ← schemas, helpers, prompts (chat + itinerary), queries
  integration/                 ← route handlers com mocks (generate-guide, chat, itinerary)
```

---

## Sobre 

 Este projeto foi feito em ~2 dias como teste técnico, aplicando os mesmos princípios de arquitetura limpa, type safety e design centrado no usuário em uma stack TypeScript + Next.js - área que estou consolidando depois de Job Radar (React/Vite) e dos meus produtos em Python.

A estrutura de commits mostra a progressão da execução em fases nítidas (scaffold → schema → página → IA → chat → testes → polish → features extras). O fluxo de trabalho usou Claude como arquiteto/orquestrador, Codex como executor de código (T1, T2, T4, T6, T8, T10, T11, T13, T14, fixes) e Claude direto nas tarefas visuais (T3.5, T5, T7, T11.6, T15) - combinando design intelligence com velocidade de execução.


