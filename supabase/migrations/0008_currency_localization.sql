-- Preço localizado por país: o preço no catálogo (products_saludperfecta)
-- continua sendo a base em USD; a cobrança real passa a variar pra moeda do
-- país do visitante. `orders_saludperfecta.total_cents`/`currency` continuam
-- representando o que foi cobrado de fato (pode não ser mais USD); as
-- colunas novas abaixo guardam o equivalente em USD (pra relatórios
-- agregados no dashboard, que não podem somar moedas diferentes) e o
-- contexto da conversão aplicada.

create table if not exists exchange_rates_saludperfecta (
  currency text primary key,
  rate_from_usd numeric not null,
  updated_at timestamptz not null default now()
);

alter table exchange_rates_saludperfecta enable row level security;

alter table orders_saludperfecta
  add column if not exists total_usd_cents integer not null default 0,
  add column if not exists fx_rate numeric,
  add column if not exists country text;

-- Todo pedido existente até aqui foi cobrado em USD, então o equivalente em
-- USD é o próprio total_cents.
update orders_saludperfecta set total_usd_cents = total_cents where currency = 'USD' and total_usd_cents = 0;
