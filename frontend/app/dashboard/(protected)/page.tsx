import { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/format";
import { getVturbSessionStats } from "@/lib/vturb/analytics";
import { PeriodFilter } from "./PeriodFilter";
import { DailySalesChart } from "./DailySalesChart";

type SearchParams = { period?: string; from?: string; to?: string };
type OrderRow = { created_at: string; total_usd_cents: number; status: string };

const PERIOD_DAYS: Record<string, number> = { hoje: 0, "7d": 6, "30d": 29, "90d": 89 };

function resolveRange(params: SearchParams): { start: Date; end: Date; isAll: boolean } {
  const now = new Date();
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

  if (params.from && params.to) {
    return {
      start: new Date(`${params.from}T00:00:00.000Z`),
      end: new Date(`${params.to}T23:59:59.999Z`),
      isAll: false,
    };
  }

  if (params.period === "todos") {
    return { start: new Date(0), end, isAll: true };
  }

  const days = params.period && params.period in PERIOD_DAYS ? PERIOD_DAYS[params.period] : PERIOD_DAYS["30d"];
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days, 0, 0, 0, 0));
  return { start, end, isAll: false };
}

function buildDailySeries(orders: OrderRow[], start: Date, end: Date) {
  const revenueByDay = new Map<string, number>();
  for (const order of orders) {
    if (order.status !== "paid" && order.status !== "mock_paid") continue;
    const day = order.created_at.slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + order.total_usd_cents);
  }

  const days: { date: string; revenueCents: number }[] = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const endDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor <= endDay) {
    const key = cursor.toISOString().slice(0, 10);
    days.push({ date: key, revenueCents: revenueByDay.get(key) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export default async function DashboardOverviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const admin = createAdminClient();
  const { start, end, isAll } = resolveRange(params);

  const [{ data: orders }, { count: leadsCount }, { count: visitsCount }, { count: checkoutClicksCount }, vturbStats] =
    await Promise.all([
      admin
        .from("orders_saludperfecta")
        .select("created_at, total_usd_cents, status")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString())
        .order("created_at", { ascending: true })
        .returns<OrderRow[]>(),
      admin
        .from("leads_saludperfecta")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
      // Proxy de "visitas ao site": conta o evento "ViewContent" (dispara uma
      // vez por carregamento da home, ver page.tsx) já auditado nessa tabela.
      // É visitas/carregamentos de página, não pessoas únicas deduplicadas —
      // não existe (ainda) um identificador de visitante persistente.
      admin
        .from("meta_events_log_saludperfecta")
        .select("id", { count: "exact", head: true })
        .eq("event_name", "ViewContent")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
      // Proxy de "cliques em ir para o checkout": conta o evento
      // "InitiateCheckout", que dispara assim que a página de checkout monta
      // — ou seja, toda vez que alguém clica em um botão que leva pra lá.
      admin
        .from("meta_events_log_saludperfecta")
        .select("id", { count: "exact", head: true })
        .eq("event_name", "InitiateCheckout")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
      getVturbSessionStats({ start, end }),
    ]);

  const allOrders = orders ?? [];
  const paidOrders = allOrders.filter((order) => order.status === "paid" || order.status === "mock_paid");
  // Pedidos podem ter sido cobrados em moedas diferentes — os agregados só
  // podem ser somados de forma consistente em USD.
  const revenueCents = paidOrders.reduce((sum, order) => sum + order.total_usd_cents, 0);
  const salesCount = paidOrders.length;
  const currency = "USD";
  const conversionRate = leadsCount ? Math.round((salesCount / leadsCount) * 1000) / 10 : 0;
  const avgTicketCents = salesCount ? Math.round(revenueCents / salesCount) : 0;

  const effectiveStart = isAll ? (allOrders[0]?.created_at ? new Date(allOrders[0].created_at) : end) : start;
  const dailySeries = buildDailySeries(allOrders, effectiveStart, end);
  const activeFrom = effectiveStart.toISOString().slice(0, 10);
  const activeTo = end.toISOString().slice(0, 10);

  const stats = [
    { label: "Visitas ao site", value: (visitsCount ?? 0).toString() },
    { label: "Cliques em ir para o checkout", value: (checkoutClicksCount ?? 0).toString() },
    { label: "Receita total", value: formatPrice(revenueCents, currency) },
    { label: "Número de vendas", value: salesCount.toString() },
    { label: "Conversão média", value: `${conversionRate}%` },
    { label: "Ticket médio", value: formatPrice(avgTicketCents, currency) },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-brand-900">Resumo de vendas</h1>
        <Suspense fallback={<div className="h-9 w-9" />}>
          <PeriodFilter activeFrom={activeFrom} activeTo={activeTo} />
        </Suspense>
      </div>

      <Card className="mt-6" hoverable={false}>
        <DailySalesChart data={dailySeries} currency={currency} />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} hoverable={false}>
            <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
            <p className="mt-2 text-3xl font-extrabold text-brand-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-bold text-brand-900">Vídeo (VTurb)</h2>
      {vturbStats ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Visualizações", value: vturbStats.total_viewed.toLocaleString("pt-BR") },
            { label: "Taxa de reprodução", value: `${vturbStats.play_rate.toFixed(1)}%` },
            { label: "Taxa de engajamento", value: `${vturbStats.engagement_rate.toFixed(1)}%` },
            { label: "Vídeos concluídos", value: vturbStats.total_finished.toLocaleString("pt-BR") },
          ].map((stat) => (
            <Card key={stat.label} hoverable={false}>
              <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-brand-900">{stat.value}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-6" hoverable={false}>
          <p className="text-sm text-slate-500">
            Não foi possível carregar as métricas do VTurb para este período.
          </p>
        </Card>
      )}
    </div>
  );
}
