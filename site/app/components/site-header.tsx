"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { BrandLockup } from "@/app/components/brand";

const LINKS = [
  { href: "#imoveis", label: "Imóveis" },
  { href: "#sobre", label: "Sobre" },
  { href: "#contato", label: "Contato" },
];

export function SiteHeader({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className={`site-header${solid || open ? " is-solid" : ""}`}>
      <div className="site-header__inner page-shell">
        <a href="#inicio" className="site-header__brand" aria-label="Gabriel Coraiola — Corretor de imóveis" onClick={() => setOpen(false)}>
          <BrandLockup />
        </a>

        <nav className="site-header__nav" aria-label="Navegação principal">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </nav>

        <button
          type="button"
          className="site-header__toggle"
          aria-expanded={open}
          aria-controls="menu-principal"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <span className="site-header__bars" aria-hidden="true"><i /><i /></span>}
        </button>
      </div>

      <div className="site-header__drawer" id="menu-principal" hidden={!open}>
        <nav aria-label="Navegação principal (móvel)">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
        </nav>
        <a className="site-header__drawer-cta" href={whatsapp} target="_blank" rel="noreferrer">
          Falar com Gabriel <MessageCircle />
        </a>
      </div>
    </header>
  );
}
