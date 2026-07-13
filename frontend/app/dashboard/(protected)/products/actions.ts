"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No autorizado");
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function saveProduct(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "");
  const isMainProduct = formData.get("isMainProduct") === "on";
  const offerRoleRaw = formData.get("offerRole");
  const payload = {
    slug: id ? undefined : slugify(String(formData.get("slug") || name)),
    name,
    headline: String(formData.get("headline") ?? "") || null,
    subheadline: String(formData.get("subheadline") ?? "") || null,
    description: String(formData.get("description") ?? "") || null,
    price_cents: Math.round(Number(formData.get("price") ?? 0) * 100),
    compare_at_price_cents: formData.get("compareAtPrice")
      ? Math.round(Number(formData.get("compareAtPrice")) * 100)
      : null,
    currency: String(formData.get("currency") ?? "USD"),
    image_path: String(formData.get("imagePath") ?? "") || null,
    pdf_path: String(formData.get("pdfPath") ?? "") || null,
    // O produto principal não tem papel de oferta; os demais, sim.
    is_main_product: isMainProduct,
    offer_role: isMainProduct ? null : offerRoleRaw ? String(offerRoleRaw) : null,
    active: formData.get("active") === "on",
    updated_at: new Date().toISOString(),
  };

  const { error } = id
    ? await admin.from("products_saludperfecta").update(payload).eq("id", id)
    : await admin.from("products_saludperfecta").insert(payload);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "Já existe um produto com esse papel (principal, upsell ou downsell). Atualize a página e tente de novo.",
      };
    }
    return { ok: false, message: "Erro ao salvar o produto." };
  }

  revalidatePath("/dashboard/products");
  return { ok: true };
}

const IMAGES_BUCKET = "product-images";

export async function uploadImage(formData: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Nenhum arquivo enviado." };
  }

  // Garante que o bucket público exista (idempotente: ignora erro se já existir).
  await admin.storage.createBucket(IMAGES_BUCKET, { public: true }).catch(() => null);

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await admin.storage.from(IMAGES_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
  });

  if (error) {
    return { ok: false, message: "Erro ao enviar a imagem." };
  }

  const { data } = admin.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

const FILES_BUCKET = "product-files";

export async function uploadProductFile(
  formData: FormData
): Promise<{ ok: boolean; path?: string; previewUrl?: string; fileName?: string; message?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Nenhum arquivo enviado." };
  }
  if (file.type !== "application/pdf") {
    return { ok: false, message: "Envie um arquivo PDF." };
  }

  // Bucket privado: é o produto pago em si, não deve ter link público
  // adivinhável. O download real acontece via URL assinada, com prazo.
  await admin.storage.createBucket(FILES_BUCKET, { public: false }).catch(() => null);

  const path = `${crypto.randomUUID()}.pdf`;
  const { error } = await admin.storage.from(FILES_BUCKET).upload(path, file, {
    contentType: "application/pdf",
  });

  if (error) {
    return { ok: false, message: "Erro ao enviar o arquivo." };
  }

  const { data: signedData } = await admin.storage.from(FILES_BUCKET).createSignedUrl(path, 3600);

  return { ok: true, path, previewUrl: signedData?.signedUrl, fileName: file.name };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; message?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("products_saludperfecta").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        ok: false,
        message: "Não é possível excluir: este produto tem vendas, leads ou é upsell/downsell de outro produto.",
      };
    }
    return { ok: false, message: "Erro ao excluir o produto." };
  }

  revalidatePath("/dashboard/products");
  return { ok: true };
}
