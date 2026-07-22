import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCheckoutSession } from "@/lib/checkout/createCheckoutSession";
import type { Order } from "@/types";

// URL do frontend (domínio separado): pra onde redirecionamos o cliente.
const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";

// Link clicável no e-mail de follow-up de carrinho abandonado: em vez de
// levar de volta pro formulário de checkout, recria a sessão da Stripe na
// hora do clique (nunca na hora de montar o e-mail — a sessão expira em
// 30min, então pré-gerar o link deixaria ele morto se o cliente demorasse
// pra abrir o e-mail) e manda o cliente direto pra tela de pagamento.
export async function GET(_request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const admin = createAdminClient();

  const { data: order } = await admin
    .from("orders_saludperfecta")
    .select("*")
    .eq("id", orderId)
    .single<Order>();

  if (!order) {
    return NextResponse.redirect(frontendUrl, { status: 302 });
  }

  // Já foi pago (por esse link ou outro caminho) — não gera uma cobrança
  // nova, só manda pra tela de sucesso.
  if (order.status === "paid" || order.status === "mock_paid") {
    return NextResponse.redirect(`${frontendUrl}/checkout/${order.product_slug}/success`, { status: 302 });
  }

  const [, ...extraItems] = order.items;
  const result = await createCheckoutSession({
    productSlug: order.product_slug,
    leadId: order.lead_id,
    email: order.email,
    fullName: order.full_name,
    extraProductSlugs: extraItems.map((item) => item.slug),
    countryCode: order.country ?? "US",
  });

  if (!result.ok) {
    return NextResponse.redirect(`${frontendUrl}/checkout/${order.product_slug}`, { status: 302 });
  }

  return NextResponse.redirect(result.checkoutUrl, { status: 302 });
}
