import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { currencyForCountry } from "@/lib/currency/countryCurrency";
import { getExchangeRate } from "@/lib/currency/rates";
import { convertUsdCentsToLocal } from "@/lib/currency/convert";
import type { OrderItem } from "@/types";

// URL do frontend (domínio separado): pra onde a Stripe redireciona o
// cliente de volta depois de pagar (ou cancelar) no Checkout hospedado.
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

export type CreateCheckoutSessionInput = {
  productSlug: string;
  leadId?: string | null;
  email: string;
  fullName?: string | null;
  extraProductSlugs?: string[];
  countryCode: string;
};

export type CreateCheckoutSessionResult =
  | { ok: true; orderId: string; checkoutUrl: string }
  | { ok: false; status: number; error: string };

// Lógica compartilhada entre o checkout normal (POST /api/checkout, a partir
// do formulário) e o "retomar pedido" (GET /api/checkout/resume/[orderId], a
// partir do link no e-mail de follow-up de carrinho abandonado). Sempre cria
// uma order nova e uma sessão da Stripe nova — nunca reaproveita uma sessão
// antiga, que pode já ter expirado.
export async function createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionResult> {
  const { productSlug, leadId, email, fullName, extraProductSlugs, countryCode } = input;
  const admin = createAdminClient();

  const { data: product, error: productError } = await admin
    .from("products_saludperfecta")
    .select("slug, name, price_cents, active")
    .eq("slug", productSlug)
    .single();

  if (productError || !product || !product.active) {
    return { ok: false, status: 404, error: "Producto no disponible" };
  }

  // As únicas ofertas extras aceitáveis são o produto classificado como
  // upsell e o classificado como downsell no catálogo — nunca confiamos em
  // slugs arbitrários vindos do client. O preço de cada uma também é
  // recalculado aqui a partir do banco.
  const { data: offerRows, error: offerError } = await admin
    .from("products_saludperfecta")
    .select("slug, name, price_cents")
    .eq("active", true)
    .in("offer_role", ["upsell", "downsell"]);

  if (offerError) {
    return { ok: false, status: 400, error: offerError.message };
  }
  const offerProducts = offerRows ?? [];

  // O produto principal e cada oferta aceita (upsell e/ou downsell) se
  // somam: nenhuma substitui a outra. Preços aqui ainda estão na base em
  // USD do catálogo.
  const requestedExtraSlugs = new Set(Array.isArray(extraProductSlugs) ? extraProductSlugs : []);
  const extraItemsUsd: OrderItem[] = offerProducts
    .filter((offer) => requestedExtraSlugs.has(offer.slug))
    .map((offer) => ({ slug: offer.slug, name: offer.name, price_cents: offer.price_cents }));
  const itemsUsd: OrderItem[] = [{ slug: product.slug, name: product.name, price_cents: product.price_cents }, ...extraItemsUsd];
  const subtotalUsdCents = itemsUsd.reduce((sum, item) => sum + item.price_cents, 0);

  const currency = currencyForCountry(countryCode);
  const rate = await getExchangeRate(admin, currency);

  function localizeItems(targetCurrency: string, targetRate: number): OrderItem[] {
    return itemsUsd.map((item) => ({ ...item, price_cents: convertUsdCentsToLocal(item.price_cents, targetCurrency, targetRate) }));
  }

  let chargeCurrency = currency;
  let chargeRate = rate;
  let items = localizeItems(chargeCurrency, chargeRate);
  let totalCents = items.reduce((sum, item) => sum + item.price_cents, 0);

  // A order nasce "pending": só vira "paid" quando o webhook da Stripe
  // confirmar o pagamento (nunca a partir da resposta do client).
  const { data: order, error: orderError } = await admin
    .from("orders_saludperfecta")
    .insert({
      lead_id: leadId ?? null,
      product_slug: product.slug,
      email,
      full_name: fullName ?? null,
      items,
      subtotal_cents: totalCents,
      discount_cents: 0,
      total_cents: totalCents,
      total_usd_cents: subtotalUsdCents,
      currency: chargeCurrency,
      fx_rate: chargeRate,
      country: countryCode,
      status: "pending",
    })
    .select("id, total_cents, currency")
    .single();

  if (orderError || !order) {
    return { ok: false, status: 400, error: orderError?.message ?? "No se pudo crear el pedido." };
  }

  // Checkout hospedado pela própria Stripe: o cliente é redirecionado pra lá
  // pra digitar o cartão, e volta pro site só depois de pagar (ou cancelar).
  // Nenhum dado de pagamento passa pelo nosso servidor.
  const stripe = getStripe();
  const orderId = order.id;

  async function createSession(sessionCurrency: string, sessionItems: OrderItem[]) {
    return stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: sessionItems.map((item) => ({
        price_data: {
          currency: sessionCurrency.toLowerCase(),
          product_data: { name: item.name },
          unit_amount: item.price_cents,
        },
        quantity: 1,
      })),
      success_url: `${frontendUrl}/checkout/${productSlug}/success?amount=${totalCents}&currency=${sessionCurrency}`,
      cancel_url: `${frontendUrl}/checkout/${productSlug}`,
      metadata: { orderId: String(orderId) },
      // Mínimo permitido pela Stripe (30min) — carrinho abandonado vira
      // "canceled" bem mais rápido que o padrão deles de 24h.
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
  }

  let session;
  try {
    session = await createSession(chargeCurrency, items);
  } catch {
    // A Stripe pode não suportar a moeda local nesta conta — em vez de
    // manter uma lista fixa (e potencialmente desatualizada) de moedas
    // suportadas, cai pra USD e tenta de novo.
    if (chargeCurrency === "USD") {
      return { ok: false, status: 502, error: "No se pudo procesar el pago. Intenta de nuevo." };
    }

    chargeCurrency = "USD";
    chargeRate = 1;
    items = itemsUsd;
    totalCents = subtotalUsdCents;

    await admin
      .from("orders_saludperfecta")
      .update({ items, subtotal_cents: totalCents, total_cents: totalCents, currency: chargeCurrency, fx_rate: chargeRate })
      .eq("id", orderId);

    try {
      session = await createSession(chargeCurrency, items);
    } catch {
      return { ok: false, status: 502, error: "No se pudo procesar el pago. Intenta de nuevo." };
    }
  }

  await admin.from("orders_saludperfecta").update({ stripe_payment_intent_id: session.id }).eq("id", orderId);

  if (!session.url) {
    return { ok: false, status: 502, error: "No se pudo iniciar el pago. Intenta de nuevo." };
  }

  return { ok: true, orderId, checkoutUrl: session.url };
}
