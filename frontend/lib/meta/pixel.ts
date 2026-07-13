"use client";

import { env } from "@/lib/env";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getFbCookies() {
  return {
    fbp: readCookie("_fbp"),
    fbc: readCookie("_fbc"),
  };
}

type TrackOptions = {
  email?: string;
  phone?: string;
  customData?: Record<string, unknown>;
};

// Dispara o evento no Pixel (client) e envia o mesmo event_id para a
// Conversions API (server), permitindo que a Meta faça deduplicação.
export function trackEvent(eventName: string, options: TrackOptions = {}) {
  const eventId = crypto.randomUUID();
  const { fbp, fbc } = getFbCookies();

  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, options.customData ?? {}, { eventID: eventId });
  }

  fetch(`${env.apiUrl}/api/meta-events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: typeof window !== "undefined" ? window.location.href : "",
      email: options.email,
      phone: options.phone,
      fbp,
      fbc,
      customData: options.customData ?? {},
    }),
    keepalive: true,
  }).catch(() => {
    // Best-effort: falha no envio server-side não deve travar a UI.
  });

  return eventId;
}
