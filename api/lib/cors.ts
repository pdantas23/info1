import { NextResponse } from "next/server";

// Lista de origens (o domínio do frontend) autorizadas a chamar esta API a
// partir do navegador. Definida via env porque a API roda num domínio
// separado do frontend (ex: api.saludperfectahoy.com vs saludperfectahoy.com).
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

function resolveOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  return origin && allowedOrigins.includes(origin) ? origin : null;
}

export function corsJson(request: Request, data: unknown, init?: ResponseInit) {
  const origin = resolveOrigin(request);
  const headers = new Headers(init?.headers);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return NextResponse.json(data, { ...init, headers });
}

export function corsPreflight(request: Request) {
  const origin = resolveOrigin(request);
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return new NextResponse(null, { status: 204, headers });
}
