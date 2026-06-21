# Fotos dos imóveis

Cada imóvel tem sua pasta com fotos próprias. As fotos são servidas como arquivos estáticos do Next.js (sem CDN externa).

## Estrutura

```
public/properties/
  FLN001/
    01.jpg
    02.jpg
    03.jpg
    04.jpg
    05.jpg
  GRM001/
    ...
  BAL001/
    ...
  RJ001/
    ...
```

## Como adicionar / trocar fotos

1. Coloque as fotos na pasta do imóvel (ex: `public/properties/FLN001/`).
2. Recomendado: arquivos `01.jpg` ... `05.jpg`, formato JPG ou WebP, ao menos 1600px de largura, otimizadas (~200-500 KB cada).
3. Atualize o array `images` no fixture correspondente em `db/fixtures/{code}.ts`:

   ```ts
   images: [
     '/properties/FLN001/01.jpg',
     '/properties/FLN001/02.jpg',
     '/properties/FLN001/03.jpg',
     '/properties/FLN001/04.jpg',
     '/properties/FLN001/05.jpg',
   ],
   ```

4. Rode `npm run db:seed` para atualizar o DB com os novos paths.
5. Refresque a página: o carrossel já vai usar as novas fotos.

## Por que paths locais e não Unsplash?

- **Autenticidade**: fotos próprias conectam o guia com o anúncio real do imóvel.
- **Performance**: servidas pelo Vercel CDN, sem requisição cross-origin.
- **Confiabilidade**: nada quebra se uma URL externa sair do ar.

## Ordem das fotos

A primeira foto (`01.jpg`) é a capa do imóvel no hero (carrega com priority). Use a melhor foto como a 01.
