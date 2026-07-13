import { sendMetaCapiEvent } from "@/lib/meta/capi";
import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { eventName, eventId, eventSourceUrl, email, phone, fbp, fbc, customData, productSlug } = body ?? {};

  if (!eventName || !eventId || !eventSourceUrl) {
    return corsJson(request, { error: "eventName, eventId e eventSourceUrl são obrigatórios" }, { status: 400 });
  }

  const result = await sendMetaCapiEvent({
    eventName,
    eventId,
    eventSourceUrl,
    email,
    phone,
    fbp,
    fbc,
    clientUserAgent: request.headers.get("user-agent") ?? undefined,
    clientIpAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    customData,
  });

  try {
    const admin = createAdminClient();
    await admin.from("meta_events_log_saludperfecta").insert({
      event_name: eventName,
      event_id: eventId,
      product_slug: productSlug ?? null,
      payload: customData ?? {},
      sent_ok: !result.skipped && Boolean(result.ok),
    });
  } catch {
    // Auditoria é best-effort; não deve travar o envio do evento.
  }

  return corsJson(request, result);
}
