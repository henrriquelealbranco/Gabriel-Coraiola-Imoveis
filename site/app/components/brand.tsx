import { MARK_PATH, MARK_VIEWBOX } from "@/app/components/brand-mark-path";

type Tone = "gold" | "current";

/**
 * Definição única do símbolo. Renderizada uma vez no layout; todas as instâncias
 * da marca na página referenciam via <use>, então o path só viaja no HTML uma vez.
 */
export function BrandSprite() {
  return (
    <svg className="brand-sprite" aria-hidden="true" focusable="false">
      <defs>
        {/* Gradiente amostrado dos tons reais do logotipo oficial */}
        <linearGradient id="gc-gold" x1="0" y1="0" x2=".35" y2="1">
          <stop offset="0%" stopColor="#f3e6b4" />
          <stop offset="36%" stopColor="#dcc189" />
          <stop offset="68%" stopColor="#bd9b57" />
          <stop offset="100%" stopColor="#8d6e37" />
        </linearGradient>
      </defs>
      <symbol id="gc-mark" viewBox={MARK_VIEWBOX}>
        <path fillRule="evenodd" d={MARK_PATH} />
      </symbol>
    </svg>
  );
}

export function BrandMark({ className, tone = "gold" }: { className?: string; tone?: Tone }) {
  return (
    <svg
      className={["brand-mark-svg", className].filter(Boolean).join(" ")}
      viewBox={MARK_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <use href="#gc-mark" fill={tone === "gold" ? "url(#gc-gold)" : "currentColor"} />
    </svg>
  );
}

/** Símbolo + assinatura tipográfica. O nome é texto real — nítido, acessível e indexável. */
export function BrandLockup({ tone = "gold", className }: { tone?: Tone; className?: string }) {
  return (
    <span className={["brand-lockup", className].filter(Boolean).join(" ")}>
      <BrandMark tone={tone} className="brand-lockup__mark" />
      <span className="brand-lockup__type">
        <span className="brand-lockup__name">Gabriel Coraiola</span>
        <span className="brand-lockup__role">Corretor de imóveis</span>
      </span>
    </span>
  );
}
