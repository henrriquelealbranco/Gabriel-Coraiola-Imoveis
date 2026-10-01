import Link from "next/link";
import { BrandLockup } from "@/app/components/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer page-shell">
      <Link href="/" aria-label="Gabriel Coraiola — Corretor de imóveis"><BrandLockup /></Link>
      <p>Imóveis em Curitiba e região · CRECI 42646</p>
    </footer>
  );
}
