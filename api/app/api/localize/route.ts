import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/cors";
import { detectCountry } from "@/lib/currency/geo";
import { currencyForCountry } from "@/lib/currency/countryCurrency";
import { getExchangeRate } from "@/lib/currency/rates";
import { convertUsdCentsToLocal } from "@/lib/currency/convert";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

// Usada pelo seletor manual de país no checkout (fallback quando a detecção
// por IP erra): recebe os slugs visíveis na página e devolve o preço de cada
// um já convertido pra moeda do país informado (ou detectado, se não vier).
export async function POST(request: Request) {
  const body = await request.json();
  const { country, slugs } = body ?? {};

  if (!Array.isArray(slugs) || slugs.length === 0) {
    return corsJson(request, { error: "slugs é obrigatório" }, { status: 400 });
  }

  const admin = createAdminClient();

  const countryCode = (typeof country === "string" && country ? country : detectCountry(request.headers)).toUpperCase();
  const currency = currencyForCountry(countryCode);
  const rate = await getExchangeRate(admin, currency);

  const { data: products, error } = await admin
    .from("products_saludperfecta")
    .select("slug, price_cents, compare_at_price_cents")
    .in("slug", slugs);

  if (error) {
    return corsJson(request, { error: error.message }, { status: 400 });
  }

  const localizedProducts: Record<string, { priceCents: number; compareAtPriceCents: number | null }> = {};
  for (const product of products ?? []) {
    localizedProducts[product.slug] = {
      priceCents: convertUsdCentsToLocal(product.price_cents, currency, rate),
      compareAtPriceCents:
        product.compare_at_price_cents !== null
          ? convertUsdCentsToLocal(product.compare_at_price_cents, currency, rate)
          : null,
    };
  }

  return corsJson(request, {
    country: countryCode,
    currency,
    rate,
    products: localizedProducts,
  });
}
