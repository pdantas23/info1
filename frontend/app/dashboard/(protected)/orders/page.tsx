import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types";

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "Pendente",
  mock_paid: "Pago (simulado)",
  paid: "Pago",
  failed: "Falhou",
};

export default async function DashboardOrdersPage() {
  const admin = createAdminClient();
  const { data: orders } = await admin
    .from("orders_saludperfecta")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Order[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Vendas / compradores</h1>
      <p className="mt-1 text-sm text-slate-500">Histórico de pedidos, incluindo bundles adquiridos.</p>

      <Card className="mt-6 overflow-x-auto p-0" hoverable={false}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-brand-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Comprador</th>
              <th className="px-5 py-3 font-semibold">Produto</th>
              <th className="px-5 py-3 font-semibold">Itens</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-t border-brand-50">
                <td className="px-5 py-3 text-slate-700">
                  <div className="font-semibold text-brand-900">{order.full_name ?? "—"}</div>
                  <div className="text-xs text-slate-500">{order.email}</div>
                </td>
                <td className="px-5 py-3 text-slate-700">{order.product_slug}</td>
                <td className="px-5 py-3 text-slate-500">{order.items.map((item) => item.name).join(", ")}</td>
                <td className="px-5 py-3 font-semibold text-brand-900">{formatPrice(order.total_cents, order.currency)}</td>
                <td className="px-5 py-3">
                  <Badge tone={order.status === "failed" ? "neutral" : "brand"}>{STATUS_LABEL[order.status]}</Badge>
                </td>
                <td className="px-5 py-3 text-slate-500">{new Date(order.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {orders && orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                  Ainda não há vendas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
