"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function login(formData: FormData): Promise<void> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Informe e-mail e senha válidos.");
  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) throw new Error("Não foi possível entrar com essas credenciais.");
  redirect("/admin/imoveis");
}

export async function logout() {
  await requireAdmin();
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
