import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectCountry } from "@/lib/currency/geo";
import { currencyForCountry } from "@/lib/currency/countryCurrency";
import { getExchangeRate } from "@/lib/currency/rates";
import { convertUsdCentsToLocal } from "@/lib/currency/convert";
import type { Product } from "@/types";
import { CheckoutExperience, type LocalizedPrice } from "./CheckoutExperience";

function localizePrice(product: Product, currency: string, rate: number): LocalizedPrice {
  return {
    priceCents: convertUsdCentsToLocal(product.price_cents, currency, rate),
    compareAtPriceCents:
      product.compare_at_price_cents !== null ? convertUsdCentsToLocal(product.compare_at_price_cents, currency, rate) : null,
  };
}

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tier?: string }>;
}) {
  const { slug } = await params;
  const { tier } = await searchParams;
  const initialTier = tier === "base" || tier === "popular" || tier === "complete" ? tier : null;
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

  // Preço no catálogo é sempre a base em USD; aqui já convertemos pro país
  // detectado por IP (o seletor manual no client corrige via /api/localize
  // se a detecção errar).
  const requestHeaders = await headers();
  const country = detectCountry(requestHeaders);
  const currency = currencyForCountry(country);
  const rate = await getExchangeRate(admin, currency);

  const prices: Record<string, LocalizedPrice> = { [product.slug]: localizePrice(product, currency, rate) };
  if (upsellProduct) prices[upsellProduct.slug] = localizePrice(upsellProduct, currency, rate);
  if (downsellProduct) prices[downsellProduct.slug] = localizePrice(downsellProduct, currency, rate);

  return (
    <CheckoutExperience
      product={product}
      upsellProduct={upsellProduct}
      downsellProduct={downsellProduct}
      localization={{ country, currency, rate, prices }}
      initialTier={initialTier}
    />
  );
}
