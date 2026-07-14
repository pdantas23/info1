-- Atualiza a URL do webhook do n8n no trigger de orders_saludperfecta.
-- O domínio antigo (automacoes-n8n.ziqe7q.easypanel.host) foi substituído
-- por n8n.saludperfectahoy.com no EasyPanel.
create or replace function notify_pedido_pago()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://n8n.saludperfectahoy.com/webhook/da17a419-040c-437b-b55f-537301a751d5',
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
