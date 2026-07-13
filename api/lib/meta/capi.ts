import "server-only";
import { createHash } from "crypto";
import { env } from "@/lib/env";

function hash(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type MetaServerEvent = {
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  actionSource?: "website";
  email?: string;
  phone?: string;
  fbp?: string | null;
  fbc?: string | null;
  clientUserAgent?: string;
  clientIpAddress?: string;
  customData?: Record<string, unknown>;
};

// Envia um evento para a Meta Conversions API. Usa o mesmo event_id do pixel
// client-side para que a Meta faça a deduplicação entre as duas fontes.
export async function sendMetaCapiEvent(event: MetaServerEvent) {
  const { pixelId, capiAccessToken } = env.meta;
  if (!pixelId || !capiAccessToken) {
    return { skipped: true as const };
  }

  const userData: Record<string, unknown> = {
    client_user_agent: event.clientUserAgent,
    client_ip_address: event.clientIpAddress,
  };
  if (event.email) userData.em = [hash(event.email)];
  if (event.phone) userData.ph = [hash(event.phone.replace(/\D/g, ""))];
  if (event.fbp) userData.fbp = event.fbp;
  if (event.fbc) userData.fbc = event.fbc;

  const body = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: event.actionSource ?? "website",
        user_data: userData,
        custom_data: event.customData ?? {},
      },
    ],
  };

  const response = await fetch(`https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${capiAccessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return { skipped: false as const, ok: response.ok, status: response.status };
}
