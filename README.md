# Guia Digital do Hóspede

Aplicação fullstack de guia digital para propriedades de aluguel por temporada, com curadoria local gerada por IA e assistente conversacional anti-alucinação. Projeto explorando design agêntico com Anthropic Claude, integração com search real-time (Tavily) e guardrails de produção.

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
- [Decisões técnicas e trade-offs](#decisões-técnicas-e-trade-offs)
- [Estratégia anti-alucinação](#estratégia-anti-alucinação)
- [Testes](#testes)
- [Sobre](#sobre)
- [Licença](#licença)

---

## O problema

Gestoras de aluguel por temporada tipicamente entregam ao hóspede um folheto digital genérico: mesmas informações, sem contexto do lugar. Quem chega num apartamento em Florianópolis recebe o mesmo material que quem chega num chalé em Gramado. Cada imóvel deveria ter um guia próprio, com dados específicos (WiFi, regras, contato) e curadoria contextual da região (restaurantes reais, atrações, dicas sazonais). Este projeto explora como uma camada de IA agêntica pode transformar essa experiência: dados literais do imóvel + curadoria contextual gerada + assistente virtual que não inventa.

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
│ 4. Zod validate            │   │    - 4 few-shot examples         │
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
| **UI** | Tailwind v4 + shadcn/ui + lucide-react | Tailwind v4 com `@theme inline` permite tokens semânticos (paleta azul/coral). shadcn copia componentes pro repo, sem fork. |
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

UI: floating launcher (FAB coral) + drawer right (desktop) ou fullscreen (mobile). Quick suggestions cobrem as 4 perguntas mais comuns (WiFi, pet, check-in, restaurantes). Estados completos: loading dots, streaming visível, error inline com retry.

### 4. Idiomas (PT / EN / ES)

Seletor de idioma com UI estática traduzida em 3 dicionários e tradução on-demand do conteúdo gerado por IA (welcome + descrições + dica sazonal via `/api/translate` com Claude). Place names e distâncias ficam em português (não traduzir "Praia da Joaquina"). O locale também viaja no body do `/api/chat`: o assistente responde em PT/EN/ES com termos regionais naturais, mantendo dados literais (rede WiFi, senha, código de acesso) intactos.

### 5. Roteiro personalizado por IA (`/api/itinerary` + `/api/itinerary/refine`)

Modal centralizado com 5 perguntas (dias, quem viaja, vibe, locomoção, restrições opcionais). Submit → Claude com `submit_itinerary` tool calling → roteiro day-by-day estruturado (manhã/tarde/noite), exibido em cards com **duração estimada** e **distância do imóvel** por atividade. Inclui botão "Copiar texto" pra compartilhar via WhatsApp/notes e botão "Expandir" pra fullscreen no mobile.

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

## Decisões técnicas e trade-offs

- **Drizzle > Prisma**: leveza (sem runtime client), SQL transparente e JSONB tipado via `.$type<X>()`. Prisma agregaria overhead de runtime + binding generation sem ganho no escopo.
- **Tavily > Google Places**: retorna conteúdo já textualizado que o LLM consome direto. Places exigiria acoplar geocoding + place_id + reviews em chamadas separadas. Trade-off aceito: distâncias estimadas pelo LLM em vez de geocoded.
- **Full agentic (tool calling) para guide**: tool calling enforça schema no nível do SDK e permite Claude complementar buscas. Pre-fetch de 3 queries paralelas evita descoberta desnecessária, limite de 8 iterações previne loop. Resultado: 2 iterações típicas, ~45s primeira geração + cache 30 dias.
- **Cache no Postgres > Redis**: JSONB no próprio DB elimina dependência extra. TTL controlado por timestamp. Redis valeria em escala real; nesse escopo, simplicidade > microsegundos.
- **Prompt engineering > RAG/fine-tuning**: contexto pequeno (~1k tokens por imóvel) não justifica vector store. Fine-tuning fora de escopo.
- **Chat sem tool calling**: contexto injetado no system prompt é suficiente. Tool calling adicionaria complexidade sem ganho funcional.
- **Chat sem persistência**: sessão in-memory reseta ao fechar. Persistir exigiria moderação, exclusão LGPD, etc. Adequado ao caso de uso (perguntas pontuais durante estadia).

---

## Estratégia anti-alucinação

Estratégia em camadas, **calibrada por feature**: chat mais rígido, guide agêntico com schema enforcement, itinerary criativo mas com validador pós-LLM.

**Chat** — Sistema prompt rígido com regras numeradas + few-shot dinâmico (dados reais do imóvel atual) + temperature 0.3 + contexto verboso injetado. Claude pode caracterizar lugares do guide com conhecimento geral, mas não inventa novos; quando insuficiente, redireciona ao anfitrião.

**Guide generation** — Tool calling enforça schema no nível do SDK (não há "JSON quebrado"). Restrições de curadoria no prompt (cidade litorânea precisa praia famosa, sem instituições acadêmicas, sem clichês de IA). Variantes por perfil (`coastal`/`mountain`/`urban`/`rural`) priorizam recomendações contextuais.

**Itinerary planner** — Allowlist de ícones por cidade (`cardinal` + `byVibe`); fora disso Claude usa tipos genéricos. Validador pós-LLM verifica raio por transporte, dias sequenciais e `from_guide` referenciando lugar real. Refinement multi-turn reaplica todos os guardrails, mantém estado só no client (limite de 5 turnos, backend retorna 429 se excedido) e traduz erros em mensagens user-friendly.

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

## Sobre

Projeto explorando engenharia de IA aplicada em contexto real: design agêntico com Anthropic Claude, integração com search real-time (Tavily), guardrails de produção calibrados por feature (chat mais rígido, roteiro criativo com validação de raio) e i18n com tradução on-demand de conteúdo gerado.

Stack escolhida com foco em qualidade técnica: TypeScript strict end-to-end, Zod como single source of truth compartilhado entre validação de API e schema do DB (JSONB tipado via Drizzle), Atomic Design nos componentes, e 47 testes cobrindo schemas, prompts anti-alucinação e route handlers.

A estrutura de commits reflete a progressão em fases nítidas (scaffold → schema → página → IA → chat → testes → polish → features avançadas), servindo como registro do processo de decisão técnica ao longo do desenvolvimento.


