import geoip from "geoip-lite";

// Aceita tanto `Request.headers` (Route Handlers) quanto o retorno de
// `headers()` do `next/headers` (Server Components) — ambos expõem `.get()`.
type HeadersLike = { get(name: string): string | null };

// Next.js 16 removeu `request.geo`/`request.ip` (ver AGENTS.md); a forma
// suportada continua sendo ler o header repassado pelo proxy na frente da
// aplicação.
export function resolveClientIp(headers: HeadersLike): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }
  return headers.get("x-real-ip");
}

// País ISO 3166-1 alpha-2 detectado pelo IP do visitante, via geoip-lite
// (lookup local, sem chamada externa). Cai em "US" quando não dá pra
// detectar (IP local/privado, lookup sem resultado etc.).
export function detectCountry(headers: HeadersLike): string {
  const clientIp = resolveClientIp(headers);
  const geo = clientIp ? geoip.lookup(clientIp) : null;
  return geo?.country ?? "US";
}
