import "server-only";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

export async function createServerClient() {
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase não configurado.");
  const cookieStore = await cookies();
  return createSupabaseServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}
