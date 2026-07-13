import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { corsJson, corsPreflight } from "@/lib/cors";
import type { OrderItem } from "@/types";

// URL do frontend (domínio separado): pra onde a Stripe redireciona o
// cliente de volta depois de pagar (ou cancelar) no Checkout hospedado.
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

export async function OPTIONS(request: Request) {
  return corsPreflight(request);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { productSlug, leadId, email, fullName, extraProductSlugs } = body ?? {};

  if (!productSlug || !email) {
    return corsJson(request, { error: "productSlug e email são obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: product, error: productError } = await admin
    .from("products_saludperfecta")
    .select("slug, name, price_cents, currency, active")
    .eq("slug", productSlug)
    .single();

  if (productError || !product || !product.active) {
    return corsJson(request, { error: "Producto no disponible" }, { status: 404 });
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
    return corsJson(request, { error: offerError.message }, { status: 400 });
  }
  const offerProducts = offerRows ?? [];

  const requestedExtraSlugs = new Set(Array.isArray(extraProductSlugs) ? extraProductSlugs : []);
  const extraItems: OrderItem[] = offerProducts
    .filter((offer) => requestedExtraSlugs.has(offer.slug))
    .map((offer) => ({ slug: offer.slug, name: offer.name, price_cents: offer.price_cents }));

  // O produto principal e cada oferta aceita (upsell e/ou downsell) se
  // somam: nenhuma substitui a outra.
  const items: OrderItem[] = [{ slug: product.slug, name: product.name, price_cents: product.price_cents }, ...extraItems];
  const subtotalCents = items.reduce((sum, item) => sum + item.price_cents, 0);
  const totalCents = subtotalCents;

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
      subtotal_cents: subtotalCents,
      discount_cents: 0,
      total_cents: totalCents,
      currency: product.currency,
      status: "pending",
    })
    .select("id, total_cents, currency")
    .single();

  if (orderError) {
    return corsJson(request, { error: orderError.message }, { status: 400 });
  }

  // Checkout hospedado pela própria Stripe: o cliente é redirecionado pra lá
  // pra digitar o cartão, e volta pro site só depois de pagar (ou cancelar).
  // Nenhum dado de pagamento passa pelo nosso servidor.
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: items.map((item) => ({
      price_data: {
        currency: order.currency.toLowerCase(),
        product_data: { name: item.name },
        unit_amount: item.price_cents,
      },
      quantity: 1,
    })),
    success_url: `${frontendUrl}/checkout/${product.slug}/success?amount=${order.total_cents}&currency=${order.currency}`,
    cancel_url: `${frontendUrl}/checkout/${product.slug}`,
    metadata: { orderId: String(order.id) },
  });

  await admin
    .from("orders_saludperfecta")
    .update({ stripe_payment_intent_id: session.id })
    .eq("id", order.id);

  if (!session.url) {
    return corsJson(request, { error: "No se pudo iniciar el pago. Intenta de nuevo." }, { status: 502 });
  }

  return corsJson(request, {
    orderId: order.id,
    checkoutUrl: session.url,
  });
}
