import { corsJson, corsPreflight } from "@/lib/cors";
import { detectCountry } from "@/lib/currency/geo";
import { createCheckoutSession } from "@/lib/checkout/createCheckoutSession";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productSlug, leadId, email, fullName, extraProductSlugs, country } = body ?? {};

  if (!productSlug || !email) {
    return corsJson(request, { error: "productSlug e email são obrigatórios" }, { status: 400 });
  }

  // O país nunca é confiado como preço/valor vindo do client — só como
  // "em que país esse visitante está" (explícito, do seletor manual, ou
  // detectado por IP). O valor cobrado é sempre recalculado a partir do
  // preço em USD do banco (ver createCheckoutSession).
  const countryCode = (typeof country === "string" && country ? country : detectCountry(request.headers)).toUpperCase();

  const result = await createCheckoutSession({ productSlug, leadId, email, fullName, extraProductSlugs, countryCode });

  if (!result.ok) {
    return corsJson(request, { error: result.error }, { status: result.status });
  }

  return corsJson(request, { orderId: result.orderId, checkoutUrl: result.checkoutUrl });
}
