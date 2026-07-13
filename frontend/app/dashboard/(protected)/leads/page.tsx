import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Lead } from "@/types";

export default async function DashboardLeadsPage() {
  const admin = createAdminClient();
  const { data: leads } = await admin
    .from("leads_saludperfecta")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<Lead[]>();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900">Leads</h1>
      <p className="mt-1 text-sm text-slate-500">Pessoas que deixaram seus dados no checkout, com ou sem compra.</p>

      <Card className="mt-6 overflow-x-auto p-0" hoverable={false}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-brand-50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Nome</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Telefone</th>
              <th className="px-5 py-3 font-semibold">País</th>
              <th className="px-5 py-3 font-semibold">Produto</th>
              <th className="px-5 py-3 font-semibold">Origem</th>
              <th className="px-5 py-3 font-semibold">Data</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((lead) => (
              <tr key={lead.id} className="border-t border-brand-50">
                <td className="px-5 py-3 text-slate-700">{lead.full_name ?? "—"}</td>
                <td className="px-5 py-3 text-slate-700">{lead.email}</td>
                <td className="px-5 py-3 text-slate-700">{lead.phone ?? "—"}</td>
                <td className="px-5 py-3 text-slate-700">{lead.country ?? "—"}</td>
                <td className="px-5 py-3 text-slate-700">{lead.product_slug}</td>
                <td className="px-5 py-3 text-slate-700">{lead.utm_source ?? "—"}</td>
                <td className="px-5 py-3 text-slate-500">{new Date(lead.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
            {leads && leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                  Ainda não há leads.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
