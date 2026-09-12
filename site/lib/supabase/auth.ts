import type { SupabaseClient } from "@supabase/supabase-js";

type AuthClient = Pick<SupabaseClient, "auth" | "from">;

export async function authorizeAdmin(client: AuthClient) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false as const, reason: "unauthenticated" as const };
  const { data } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) return { ok: false as const, reason: "forbidden" as const };
  return { ok: true as const, userId: user.id };
}

export async function requireAdmin() {
  const { createServerClient } = await import("@/lib/supabase/server");
  const result = await authorizeAdmin(await createServerClient() as never);
  if (!result.ok) {
    const { redirect } = await import("next/navigation");
    redirect(result.reason === "unauthenticated" ? "/admin/login" : "/");
  }
  return result;
}
