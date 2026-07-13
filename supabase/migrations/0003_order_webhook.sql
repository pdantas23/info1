-- Database Webhook manual (via pg_net) para orders_saludperfecta -> n8n.
-- Alternativa à UI "Database > Webhooks" do Studio, caso ela não esteja
-- disponível nesta versão. Dispara em insert e update, enviando a linha
-- inteira do pedido pro workflow do n8n que cuida da entrega dos produtos.
create extension if not exists pg_net;

create or replace function notify_pedido_pago()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://automacoes-n8n.ziqe7q.easypanel.host/webhook/da17a419-040c-437b-b55f-537301a751d5',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(new)
    )
  );
  return new;
end;
$$;

drop trigger if exists trigger_pedido_pago on orders_saludperfecta;
create trigger trigger_pedido_pago
after insert or update on orders_saludperfecta
for each row
execute function notify_pedido_pago();
