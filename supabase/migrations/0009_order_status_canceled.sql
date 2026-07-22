-- Novo status "canceled": usado quando a sessão de Checkout da Stripe expira
-- (comprador abriu o checkout mas nunca terminou de pagar) — diferente de
-- "failed", que fica reservado para uma tentativa de pagamento recusada.

alter table orders_saludperfecta
  drop constraint if exists orders_saludperfecta_status_check;

alter table orders_saludperfecta
  add constraint orders_saludperfecta_status_check
  check (status in ('pending', 'mock_paid', 'paid', 'failed', 'canceled'));
