import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Resumo", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produtos", icon: Package },
  { href: "/dashboard/leads", label: "Leads", icon: Users },
  { href: "/dashboard/orders", label: "Vendas", icon: ShoppingCart },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificação server-side além do proxy.ts, seguindo a recomendação do
  // Next.js de não depender só do proxy para autenticação/autorização.
  if (!user) {
    redirect("/dashboard/login");
  }

  return (
    <div className="flex min-h-screen bg-brand-50">
      <aside className="flex w-64 shrink-0 flex-col border-r border-brand-100 bg-white">
        <div className="px-6 py-5">
          <span className="text-lg font-extrabold text-brand-800">Dashboard</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-brand-50 hover:text-brand-700"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-brand-100 px-6 py-4">
          <p className="truncate text-sm text-slate-500">{user.email}</p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
