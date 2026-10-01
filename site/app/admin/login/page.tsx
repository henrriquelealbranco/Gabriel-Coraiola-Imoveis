"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/app/components/brand";
import { login } from "@/app/admin/actions";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(login, null);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?type=recovery`;
    await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo });
    setResetMsg("Se esse e-mail estiver cadastrado, você receberá um link em instantes.");
  }

  if (showReset) {
    return (
      <main className="admin-login">
        <form onSubmit={handleReset} className="admin-login-card">
          <BrandMark className="admin-login-mark" />
          <div>
            <p className="eyebrow">Acesso administrativo</p>
            <h1>Recuperar acesso</h1>
          </div>
          {resetMsg
            ? <p className="form-success" role="status">{resetMsg}</p>
            : <>
                <label>E-mail<input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} autoComplete="email" required /></label>
                <button type="submit">Enviar link de recuperação</button>
              </>
          }
          <button type="button" onClick={() => setShowReset(false)} className="link-button">Voltar ao login</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-login">
      <form action={formAction} className="admin-login-card">
        <BrandMark className="admin-login-mark" />
        <div>
          <p className="eyebrow">Acesso administrativo</p>
          <h1>Painel de imóveis</h1>
        </div>
        {error && <p className="admin-error">{error}</p>}
        <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
        <label>Senha<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
        <button type="submit" disabled={isPending}>{isPending ? "Entrando…" : "Entrar"}</button>
        <button type="button" onClick={() => setShowReset(true)} className="link-button">Esqueci minha senha</button>
        <Link href="/">Voltar ao site</Link>
      </form>
    </main>
  );
}
