import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Falta la firma del webhook" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, env.stripe.webhookSecret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const admin = createAdminClient();

  // A order só é marcada como "paid" aqui, nunca a partir do redirect do
  // client: é o webhook que confirma que a Stripe de fato recebeu o
  // pagamento no Checkout hospedado. Essa mudança de status dispara o
  // trigger pg_net que avisa o n8n para enviar o PDF por email.
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await admin.from("orders_saludperfecta").update({ status: "paid" }).eq("id", orderId);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await admin.from("orders_saludperfecta").update({ status: "failed" }).eq("id", orderId);
    }
  }

  return NextResponse.json({ received: true });
}
