-- Substitui o modelo da migration anterior (cada produto apontando pro seu
-- próprio upsell/downsell) por um modelo mais simples: existe só UM produto
-- principal (is_main_product), e os demais produtos se auto-classificam com
-- um papel (offer_role) em relação a esse produto principal.
alter table products_saludperfecta drop column if exists upsell_product_id;
alter table products_saludperfecta drop column if exists downsell_product_id;

alter table products_saludperfecta add column if not exists is_main_product boolean not null default false;
alter table products_saludperfecta add column if not exists offer_role text check (offer_role in ('upsell', 'downsell'));

-- Garante no máximo 1 produto principal, no máximo 1 upsell e no máximo 1
-- downsell em todo o catálogo.
create unique index if not exists products_saludperfecta_one_main_idx on products_saludperfecta (is_main_product) where is_main_product;
create unique index if not exists products_saludperfecta_one_upsell_idx on products_saludperfecta (offer_role) where offer_role = 'upsell';
create unique index if not exists products_saludperfecta_one_downsell_idx on products_saludperfecta (offer_role) where offer_role = 'downsell';

-- Movilidad Total é o produto principal atual do funil.
update products_saludperfecta set is_main_product = true where slug = 'movilidad-total';
