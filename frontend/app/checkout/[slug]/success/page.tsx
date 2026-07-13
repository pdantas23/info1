import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { SuccessExperience } from "./SuccessExperience";

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ amount?: string; currency?: string }>;
}) {
  const { slug } = await params;
  const { amount, currency } = await searchParams;

  const admin = createAdminClient();
  const { data: product } = await admin
    .from("products_saludperfecta")
    .select("name, currency")
    .eq("slug", slug)
    .single<{ name: string; currency: string }>();

  if (!product) {
    notFound();
  }

  return (
    <SuccessExperience
      productName={product.name}
      amountCents={amount ? Number(amount) : null}
      currency={currency ?? product.currency}
    />
  );
}
