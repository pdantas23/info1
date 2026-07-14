import { createAdminClient } from "@/lib/supabase/admin";
import { corsJson, corsPreflight } from "@/lib/cors";
import { detectCountry } from "@/lib/currency/geo";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    productSlug,
    fullName,
    email,
    phone,
    country,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    fbp,
    fbc,
  } = body ?? {};

  if (!productSlug || !email) {
    return corsJson(request, { error: "productSlug e email são obrigatórios" }, { status: 400 });
  }

  // Se o cliente não informar o país explicitamente, tentamos detectar pelo
  // IP (via geoip-lite, sem chamada externa) usando o IP repassado pelo proxy.
  const resolvedCountry: string = country || detectCountry(request.headers);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("leads_saludperfecta")
    .insert({
      product_slug: productSlug,
      full_name: fullName ?? null,
      email,
      phone: phone ?? null,
      country: resolvedCountry,
      utm_source: utmSource ?? null,
      utm_medium: utmMedium ?? null,
      utm_campaign: utmCampaign ?? null,
      utm_content: utmContent ?? null,
      utm_term: utmTerm ?? null,
      fbp: fbp ?? null,
      fbc: fbc ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return corsJson(request, { error: error.message }, { status: 400 });
  }

  return corsJson(request, { leadId: data.id });
}
