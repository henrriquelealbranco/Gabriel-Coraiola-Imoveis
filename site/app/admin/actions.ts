"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/auth";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function login(prevState: string | null, formData: FormData): Promise<string | null> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return "Informe e-mail e senha válidos.";
  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return "Não foi possível entrar com essas credenciais.";
    redirect("/admin/imoveis");
  } catch (e) {
    // redirect() throws a NEXT_REDIRECT — let it propagate; other errors return message
    if (e instanceof Error && "digest" in e) throw e;
    return "Ocorreu um erro inesperado. Tente novamente.";
  }
  return null;
}

export async function logout() {
  await requireAdmin();
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
