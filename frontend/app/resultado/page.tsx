import type { Metadata } from "next";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ResultadoExperience } from "./ResultadoExperience";
import type { Product } from "@/types";

export const metadata: Metadata = {
  title: "Tu plan personalizado — Movilidad Total",
};

export default async function ResultadoPage() {
  // Fuerza render dinámico: sin esto, Next intenta pre-renderizar esta
  // página como estática en el build (no usa ninguna API dinámica), lo que
  // exigiría SUPABASE_SERVICE_ROLE_KEY como build-arg. De paso, los precios
  // y productos siempre quedan al día, igual que en /checkout.
  await connection();

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
