-- Os bundles deixam de ser entidades fixas: agora só existem produtos, e cada
-- produto pode apontar para um produto de upsell (2ª oferta, no carrinho) e
-- um produto de downsell (3ª oferta/última chance, ao clicar em pagar).
alter table products_saludperfecta add column if not exists upsell_product_id uuid references products_saludperfecta(id);
alter table products_saludperfecta add column if not exists downsell_product_id uuid references products_saludperfecta(id);

-- Migra os bundles existentes para produtos de verdade, preservando imagem,
-- PDF, preço e descrição já cadastrados. As tabelas de bundle não são
-- apagadas (fica só sem uso) para não perder histórico.
insert into products_saludperfecta (slug, name, description, price_cents, compare_at_price_cents, currency, image_path, pdf_path, active)
select slug, name, description, price_cents, compare_at_price_cents, 'USD', image_path, pdf_path, active
from bundles_saludperfecta
on conflict (slug) do nothing;

-- Reaplica a convenção que já existia no checkout: o bundle mais caro vira a
-- 2ª oferta (upsell) e o mais barato vira a 3ª oferta (downsell) do produto
-- principal. Ajustável depois pelo dashboard.
update products_saludperfecta as main
set
  upsell_product_id = (
    select p.id from products_saludperfecta p
    join bundles_saludperfecta b on b.slug = p.slug
    order by b.price_cents desc
    limit 1
  ),
  downsell_product_id = (
    select p.id from products_saludperfecta p
    join bundles_saludperfecta b on b.slug = p.slug
    order by b.price_cents asc
    limit 1
  )
where main.slug = 'movilidad-total'
  and exists (select 1 from bundles_saludperfecta);
