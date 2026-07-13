import Stripe from "stripe";
import { env } from "@/lib/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!env.stripe.secretKey) {
      throw new Error("Falta la variable de entorno STRIPE_SECRET_KEY");
    }
    stripeClient = new Stripe(env.stripe.secretKey);
  }
  return stripeClient;
}
