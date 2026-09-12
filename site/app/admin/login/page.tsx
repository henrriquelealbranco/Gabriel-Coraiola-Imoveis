import Link from "next/link";
import { login } from "@/app/admin/actions";

export default function AdminLoginPage() {
  return <main className="admin-login"><form action={login} className="admin-login-card"><span className="brand-mark">GC</span><div><p className="eyebrow">Acesso administrativo</p><h1>Painel de imóveis</h1></div><label>E-mail<input name="email" type="email" autoComplete="email" required /></label><label>Senha<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label><button type="submit">Entrar</button><Link href="/">Voltar ao site</Link></form></main>;
}
