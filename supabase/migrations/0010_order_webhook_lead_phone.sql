-- orders_saludperfecta não guarda telefone (isso mora em leads_saludperfecta).
-- Pra permitir um follow-up por WhatsApp no n8n quando um pedido vira
-- "canceled" (carrinho abandonado), o trigger passa a buscar o telefone do
-- lead vinculado e incluir junto no payload do webhook.
create or replace function notify_pedido_pago()
returns trigger
language plpgsql
security definer
as $$
declare
  lead_row leads_saludperfecta;
begin
  if new.lead_id is not null then
    select * into lead_row from leads_saludperfecta where id = new.lead_id;
  end if;

  perform net.http_post(
    url := 'https://n8n.saludperfectahoy.com/webhook/da17a419-040c-437b-b55f-537301a751d5',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(new),
      'lead_phone', lead_row.phone
    )
  );
  return new;
end;
$$;
