-- Adiciona imagem aos bundles, no mesmo padrão dos produtos.
alter table bundles_saludperfecta add column if not exists image_path text;
