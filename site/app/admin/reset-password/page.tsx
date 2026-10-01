"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/app/components/brand";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 8) { setError("A senha deve ter pelo menos 8 caracteres."); return; }
    setLoading(true);
    const supabase = createBrowserClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError("Não foi possível atualizar a senha. Solicite um novo link de recuperação.");
      setLoading(false);
      return;
    }
    router.push("/admin/imoveis");
  }

  return (
    <main className="admin-login">
      <form onSubmit={handleSubmit} className="admin-login-card">
        <BrandMark className="admin-login-mark" />
        <div>
          <p className="eyebrow">Acesso administrativo</p>
          <h1>Criar nova senha</h1>
        </div>
        {error && <p className="admin-error">{error}</p>}
        <label>Nova senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
        <label>Confirmar nova senha<input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
        <button type="submit" disabled={loading}>{loading ? "Salvando…" : "Salvar nova senha"}</button>
      </form>
    </main>
  );
}
