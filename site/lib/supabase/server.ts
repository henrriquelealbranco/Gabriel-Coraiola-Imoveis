import "server-only";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
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
