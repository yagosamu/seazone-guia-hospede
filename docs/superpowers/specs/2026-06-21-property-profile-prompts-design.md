# Perfis de imóvel para curadoria por IA

## Objetivo

Enriquecer a geração do guia e o chat com prioridades de curadoria adequadas ao contexto do imóvel, sem permitir que o perfil seja tratado como fonte de fatos novos.

## Escopo

- Derivar perfis a partir de cidade, estado e amenities já existentes.
- Aplicar os perfis aos prompts de geração do guia e do chat.
- Cobrir os perfis deriváveis pelos fixtures atuais: `coastal`, `mountain` e `urban`.
- Manter um perfil `rural` disponível como fallback futuro, sem alterar fixtures ou schema nesta etapa.
- Adicionar testes unitários para resolução e injeção no prompt.

## Modelo

`resolvePropertyProfiles(property)` retorna uma lista ordenada de tags. Um imóvel pode ter mais de um perfil. A resolução é determinística, sem chamadas externas ou dados persistidos:

- `coastal`: cidade litorânea conhecida ou amenity `beachfront`, `near_beach` ou `sea_view`.
- `mountain`: cidade serrana conhecida ou amenity `mountain_view`, `heater` ou `fireplace`.
- `urban`: cidade urbana conhecida ou sinais de apartamento/serviços urbanos como elevador e portaria.
- `rural`: fallback quando não houver outro perfil.

Os fixtures esperados são: FLN001 `coastal`, GRM001 `mountain`, BAL001 `coastal` + `urban` e RJ001 `coastal` + `urban`.

## Prompt

Os prompts recebem os perfis ativos e um bloco de regras comum:

> Perfis definem prioridade de seleção e contextualização, nunca são fonte de fatos novos. Recomende apenas locais presentes nas buscas ou no guia. Não afirme clima, maré, trânsito, segurança, disponibilidade, horários, acessibilidade ou condições de estrada sem evidência explícita. Quando faltar evidência, priorize o melhor resultado disponível ou reconheça a limitação.

Cada perfil acrescenta prioridades curtas:

- `coastal`: praia, orla, restaurantes litorâneos e conveniência pós-praia.
- `mountain`: gastronomia, mirantes, passeios internos e opções para clima frio/chuvoso.
- `urban`: mobilidade, cultura, restaurantes e serviços essenciais.
- `rural`: chegada, abastecimento, natureza e planejamento prévio.

No chat, o bloco é reduzido: ele orienta a preferência da resposta, sem apresentar a classificação ao hóspede e preservando todas as regras anti-alucinação existentes.

## Arquitetura

Um módulo puro em `lib/property-profiles.ts` concentra o tipo, a resolução e a serialização das diretrizes. `lib/experiences/prompts.ts` e `lib/chat/prompt.ts` o consomem. Não haverá migration, alteração de fixture, chamada de API nem mudança no formato do banco.

## Falhas e limites

A resolução sempre retorna ao menos `rural`, logo o prompt não depende de um perfil opcional. Tags desconhecidas não são aceitas pelo tipo. A ausência de resultados de busca não é compensada pelo perfil.

## Testes

- Verificar os perfis retornados para FLN001, GRM001, BAL001 e RJ001.
- Verificar o fallback `rural` em um imóvel sem sinais conhecidos.
- Verificar que o prompt de guia e o prompt de chat contêm o bloco de perfil e a regra de não inventar fatos.
- Executar `npx tsc --noEmit`, `npm test` e `npm run build`.
