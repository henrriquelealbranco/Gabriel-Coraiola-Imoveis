import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <><header className="admin-header"><Link href="/admin/imoveis" className="brand"><span className="brand-mark">GC</span><strong>Gestão de imóveis</strong></Link><nav><Link href="/">Ver site</Link><form action={logout}><button type="submit">Sair</button></form></nav></header>{children}</>;
}
