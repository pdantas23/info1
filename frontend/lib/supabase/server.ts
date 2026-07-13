import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

// Client com sessão do usuário autenticado, para Server Components e Route
// Handlers do dashboard (login/logout, leitura da sessão).
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(env.supabase.url(), env.supabase.anonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component sem permissão de escrita;
          // a sessão é revalidada pelo proxy.ts em cada request.
        }
      },
    },
  });
}
