import type { SupabaseClient } from "@supabase/supabase-js";

const RATES_TABLE = "exchange_rates_saludperfecta";
const STALE_AFTER_MS = 12 * 60 * 60 * 1000; // 12h — a fonte em si atualiza ~1x/dia.
const RATES_API_URL = "https://open.er-api.com/v6/latest/USD";

type RatesApiResponse = {
  result: string;
  rates: Record<string, number>;
};

async function fetchAndCacheAllRates(admin: SupabaseClient): Promise<Record<string, number> | null> {
  try {
    // `cache: "no-store"`: o frescor é controlado pela própria tabela
    // (updated_at), não pelo cache de fetch do Next — evita o fetch congelar
    // num valor de build time.
    const response = await fetch(RATES_API_URL, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as RatesApiResponse;
    if (data.result !== "success" || !data.rates) return null;

    const now = new Date().toISOString();
    const rows = Object.entries(data.rates).map(([currency, rate]) => ({
      currency,
      rate_from_usd: rate,
      updated_at: now,
    }));
    await admin.from(RATES_TABLE).upsert(rows, { onConflict: "currency" });
    return data.rates;
  } catch {
    return null;
  }
}

// Taxa de câmbio USD -> `currency`. Nunca lança: se a API de câmbio estiver
// fora do ar e não houver nada em cache, cai em 1 (equivale a manter USD) —
// o checkout não pode quebrar por causa disso.
export async function getExchangeRate(admin: SupabaseClient, currency: string): Promise<number> {
  if (currency === "USD") return 1;

  const { data: cached } = await admin
    .from(RATES_TABLE)
    .select("rate_from_usd, updated_at")
    .eq("currency", currency)
    .maybeSingle();

  const isFresh = cached ? Date.now() - new Date(cached.updated_at).getTime() < STALE_AFTER_MS : false;
  if (isFresh && cached) return Number(cached.rate_from_usd);

  const freshRates = await fetchAndCacheAllRates(admin);
  if (freshRates && currency in freshRates) return freshRates[currency];

  return cached ? Number(cached.rate_from_usd) : 1;
}
