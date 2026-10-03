import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export function createBrowserClient() {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase não configurado.");
  return createSupabaseBrowserClient(url, key);
}
