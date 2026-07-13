import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItem, Product } from "@/types";
import { ProductsManager } from "./ProductsManager";

type OrderRow = { total_cents: number; status: string; items: OrderItem[] };

export default async function DashboardProductsPage() {
  const admin = createAdminClient();

  const [{ data: products }, { data: orders }] = await Promise.all([
    admin.from("products_saludperfecta").select("*").order("created_at", { ascending: false }).returns<Product[]>(),
    admin.from("orders_saludperfecta").select("total_cents, status, items").returns<OrderRow[]>(),
  ]);

  // Cada item do pedido é um produto de verdade agora (principal, upsell ou
  // downsell aceitos), então a venda é contada por item, não por pedido.
  const salesByProduct: Record<string, { count: number; revenueCents: number }> = {};

  for (const order of orders ?? []) {
    if (order.status !== "paid" && order.status !== "mock_paid") continue;

    for (const item of order.items ?? []) {
      const entry = salesByProduct[item.slug] ?? { count: 0, revenueCents: 0 };
      entry.count += 1;
      entry.revenueCents += item.price_cents;
      salesByProduct[item.slug] = entry;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Produtos</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gerencie preços, imagens e ofertas de upsell/downsell. Esses dados alimentam o checkout.
      </p>
      <div className="mt-6">
        <ProductsManager products={products ?? []} salesByProduct={salesByProduct} />
      </div>
    </div>
  );
}
