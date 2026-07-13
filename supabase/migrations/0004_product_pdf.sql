-- Arquivo digital (PDF) entregue ao cliente após a compra, tanto para
-- produtos quanto para bundles.
alter table products_saludperfecta add column if not exists pdf_path text;
alter table bundles_saludperfecta add column if not exists pdf_path text;
