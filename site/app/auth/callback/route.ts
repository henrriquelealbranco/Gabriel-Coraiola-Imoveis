import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "recovery") as EmailOtpType;

  const supabase = await createServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/admin/login?erro=link-invalido", origin));
  } else if (token_hash) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (error) return NextResponse.redirect(new URL("/admin/login?erro=link-invalido", origin));
  } else {
    return NextResponse.redirect(new URL("/admin/login", origin));
  }

  if (type === "recovery") {
    return NextResponse.redirect(new URL("/admin/reset-password", origin));
  }

  return NextResponse.redirect(new URL("/admin/imoveis", origin));
}
