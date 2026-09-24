# COLAE

MVP inicial da plataforma de orçamentos da COLAE.

## Stack
- Next.js + React + TypeScript
- pnpm workspaces
- Motor de preços server-side em `packages/pricing`
- API de orçamento em `apps/web/app/api/quote/route.ts`

## Fluxo MVP
Produto → Material → Tamanho → Quantidade → Acabamento → Cálculo → Resumo do orçamento.

## Desenvolvimento
```bash
pnpm install
pnpm dev
```

A precificação acontece no servidor; o navegador envia apenas os parâmetros do orçamento.
