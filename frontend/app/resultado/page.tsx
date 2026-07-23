import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { ResultadoExperience } from "./ResultadoExperience";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Tu plan personalizado — Movilidad Total",
};

export default async function ResultadoPage() {
  const admin = createAdminClient();
  const { data: products } = await admin
    .from("products_saludperfecta")
    .select("*")
    .eq("active", true)
    .returns<Product[]>();

  const mainProduct = (products ?? []).find((p) => p.is_main_product) ?? null;
  const extraProducts = (products ?? []).filter((p) => p.offer_role !== null);

  if (!mainProduct) return null;

  return <ResultadoExperience mainProduct={mainProduct} extraProducts={extraProducts} />;
}
