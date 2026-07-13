-- Schema inicial: produtos, bundles, leads e orders.
-- Rode este arquivo no SQL editor do seu projeto Supabase (ou via `supabase db push`).

create extension if not exists "pgcrypto";

-- Este banco Supabase self-hosted é compartilhado entre vários funis/apps da
-- Salud Perfecta, então as tabelas usam o sufixo `_saludperfecta` para evitar
-- colisão de nomes. Os renames abaixo são idempotentes: se uma versão antiga
-- desta migration já rodou nesta instância (tabelas sem sufixo), elas são
-- renomeadas; caso contrário (instância nova) os `if exists` não fazem nada.
alter table if exists products rename to products_saludperfecta;
alter table if exists bundles rename to bundles_saludperfecta;
alter table if exists bundle_items rename to bundle_items_saludperfecta;
alter table if exists leads rename to leads_saludperfecta;
alter table if exists orders rename to orders_saludperfecta;
alter table if exists meta_events_log rename to meta_events_log_saludperfecta;

alter index if exists leads_product_slug_idx rename to leads_saludperfecta_product_slug_idx;
alter index if exists leads_email_idx rename to leads_saludperfecta_email_idx;
alter index if exists orders_product_slug_idx rename to orders_saludperfecta_product_slug_idx;
alter index if exists orders_status_idx rename to orders_saludperfecta_status_idx;

create table if not exists products_saludperfecta (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  headline text,
  subheadline text,
  description text,
  price_cents integer not null,
  compare_at_price_cents integer,
  currency text not null default 'USD',
  image_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists bundles_saludperfecta (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  price_cents integer not null,
  compare_at_price_cents integer,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists bundle_items_saludperfecta (
  bundle_id uuid not null references bundles_saludperfecta(id) on delete cascade,
  product_id uuid not null references products_saludperfecta(id) on delete cascade,
  primary key (bundle_id, product_id)
);

create table if not exists leads_saludperfecta (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null references products_saludperfecta(slug),
  full_name text,
  email text not null,
  phone text,
  country text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbp text,
  fbc text,
  created_at timestamptz not null default now()
);

create index if not exists leads_saludperfecta_product_slug_idx on leads_saludperfecta(product_slug);
create index if not exists leads_saludperfecta_email_idx on leads_saludperfecta(email);

create table if not exists orders_saludperfecta (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads_saludperfecta(id),
  product_slug text not null references products_saludperfecta(slug),
  email text not null,
  full_name text,
  items jsonb not null default '[]',
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending', 'mock_paid', 'paid', 'failed')),
  stripe_payment_intent_id text,
  created_at timestamptz not null default now()
);

create index if not exists orders_saludperfecta_product_slug_idx on orders_saludperfecta(product_slug);
create index if not exists orders_saludperfecta_status_idx on orders_saludperfecta(status);

create table if not exists meta_events_log_saludperfecta (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  event_id text not null,
  product_slug text,
  payload jsonb,
  sent_ok boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS: nega tudo por padrão. Toda leitura/escrita de dados de negócio passa
-- pelas API routes / server components usando a service-role key (nunca
-- exposta ao browser), então não é necessário criar policies de acesso público.
alter table products_saludperfecta enable row level security;
alter table bundles_saludperfecta enable row level security;
alter table bundle_items_saludperfecta enable row level security;
alter table leads_saludperfecta enable row level security;
alter table orders_saludperfecta enable row level security;
alter table meta_events_log_saludperfecta enable row level security;

-- Produto de exemplo (Movilidad Total) para o funil funcionar out-of-the-box.
insert into products_saludperfecta (slug, name, headline, subheadline, description, price_cents, compare_at_price_cents, currency)
values (
  'movilidad-total',
  'Movilidad Total',
  'Programa #1 en movilidad para adultos',
  'Recupera tu movilidad y vuelve a disfrutar de una vida sin dolor.',
  'Descubre un programa práctico diseñado para ayudarte a mejorar tu movilidad, reducir las molestias articulares y recuperar la confianza para realizar tus actividades diarias.',
  4700,
  9700,
  'USD'
)
on conflict (slug) do nothing;

-- Bundles de ejemplo para el flujo de upsell/downsell del checkout: se
-- ofrecen del más caro al más barato, uno a la vez.
insert into bundles_saludperfecta (slug, name, description, price_cents, compare_at_price_cents, sort_order)
values
  (
    'plan-nutricion-antiinflamatoria',
    'Plan de Nutrición Antiinflamatoria',
    'Guía de alimentación pensada para reducir la inflamación y potenciar tus resultados.',
    2700,
    5700,
    1
  ),
  (
    'guia-estiramientos-express',
    'Guía de Estiramientos Express',
    'Rutinas cortas de estiramiento para hacer antes o después de tus sesiones.',
    900,
    1900,
    2
  )
on conflict (slug) do nothing;
