# Movilidad Total — VSL + Checkout + Dashboard

Funil completo: página de vendas (VSL) → checkout próprio (lead + bundles + pagamento mock) → dashboard administrativo. Stack: Next.js (App Router) + TypeScript + Tailwind CSS v4 + Supabase + Meta Pixel/Conversions API. Pagamento real (Stripe) ainda não está implementado — o checkout hoje simula o pagamento.

## Configuração

1. Copie `.env.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — do seu projeto Supabase.
   - `NEXT_PUBLIC_META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` — do seu Business Manager (opcional; sem eles o tracking é ignorado silenciosamente).
   - `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — reservados para quando a integração real do Stripe entrar.
2. Rode o SQL de `supabase/migrations/0001_init.sql` no SQL editor do seu projeto Supabase (cria as tabelas e já insere o produto "Movilidad Total").
3. Crie um usuário no Supabase Auth (Authentication → Users → Add user) para conseguir logar em `/dashboard/login`. Não há cadastro público.
4. `npm install` e `npm run dev`.

## Estrutura

- `app/page.tsx` — VSL, todas as seções inline.
- `app/checkout/[slug]/` — checkout (lead → bundles → pagamento mock).
- `app/dashboard/` — área administrativa protegida por Supabase Auth (produtos, bundles, leads, ventas).
- `components/ui/` — primitivos reutilizáveis (Button, Card, Input, Accordion etc.).
- `lib/meta/` — helpers de Meta Pixel (client) e Conversions API (server), com dedup por `event_id`.
- `lib/supabase/` — clients Supabase (admin com service-role, server com sessão do usuário, browser).

## Imagens e vídeo

Todos os espaços de mídia hoje são placeholders (`ImagePlaceholder`/`VideoPlaceholder`) que mostram o caminho esperado em `public/`, por exemplo:

- `/images/movilidad-total/hero.jpg`
- `/images/movilidad-total/audiencia.jpg`
- `/videos/movilidad-total/vsl.mp4`

Quando as imagens/vídeos reais forem colocados em `public/`, é só avisar para trocar os placeholders pelos componentes `<Image>`/`<video>` reais.

## Próximos passos conhecidos

- Integração real do Stripe (hoje o checkout só simula o pagamento e marca a order como `mock_paid`).
- Upload de imagens direto pelo dashboard (hoje o campo é um caminho de texto).
