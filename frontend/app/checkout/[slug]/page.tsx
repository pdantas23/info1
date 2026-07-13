import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/types";
import { CheckoutExperience } from "./CheckoutExperience";

export default async function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products_saludperfecta")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single<Product>();

  if (!product) {
    notFound();
  }

  const { data: offerProducts } = await admin
    .from("products_saludperfecta")
    .select("*")
    .eq("active", true)
    .in("offer_role", ["upsell", "downsell"])
    .returns<Product[]>();

  const upsellProduct = (offerProducts ?? []).find((candidate) => candidate.offer_role === "upsell") ?? null;
  const downsellProduct = (offerProducts ?? []).find((candidate) => candidate.offer_role === "downsell") ?? null;

  return <CheckoutExperience product={product} upsellProduct={upsellProduct} downsellProduct={downsellProduct} />;
}
