import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";
import { SUPABASE_SERVICE_KEY } from "./admin-key";

export function createAdminClient() {
  const url = SUPABASE_URL;
  const key = SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Credenciais administrativas do Supabase não configuradas.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
