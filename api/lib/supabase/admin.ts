import "server-only";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Client com service-role key: só pode ser importado em código server-side
// (API routes, server components). Nunca expor essa chave ao browser.
export function createAdminClient() {
  return createClient(env.supabase.url(), env.supabase.serviceRoleKey(), {
    auth: { persistSession: false },
  });
}
