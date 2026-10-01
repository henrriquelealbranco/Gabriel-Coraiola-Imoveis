"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { photoAlt } from "@/lib/properties/format";
import type { PropertyImage } from "@/lib/properties/types";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const rail = useRef<HTMLOListElement>(null);
  // Alvo da navegação separado do que está na tela: cliques rápidos somam em vez de repetir o mesmo passo.
  const target = useRef(0);
  const [current, setCurrent] = useState(0);

  const indexOnScreen = () => {
    const element = rail.current;
    return element ? Math.round(element.scrollLeft / element.clientWidth) : 0;
  };

  const move = (direction: -1 | 1) => {
    const next = Math.min(Math.max(target.current + direction, 0), images.length - 1);
    target.current = next;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.current?.scrollTo({ left: next * rail.current.clientWidth, behavior: reduced ? "auto" : "smooth" });
    setCurrent(next);
  };

  if (!images.length) return <section className="conversion-gallery gallery-empty" aria-label="Fotos do imóvel">Fotos em preparação</section>;

  return (
    <section
      className="conversion-gallery"
      aria-label="Fotos do imóvel"
      tabIndex={images.length > 1 ? 0 : undefined}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      }}
    >
      <ol
        ref={rail}
        onScroll={() => setCurrent(indexOnScreen())}
        onScrollEnd={() => { target.current = indexOnScreen(); setCurrent(target.current); }}
      >
        {images.map((image, index) => (
          <li key={image.id}>
            {/* Fundo com a própria foto desfocada: preenche as laterais sem cortar nada da imagem. */}
            <span className="gallery-backdrop" style={{ backgroundImage: `url("${image.url}")` }} aria-hidden="true" />
            <Image src={image.url} alt={photoAlt(title, index)} fill style={{ objectFit: "contain", zIndex: 1 }} sizes="100vw" priority={index === 0} fetchPriority={index === 0 ? "high" : undefined} loading={index === 0 ? "eager" : "lazy"} />
          </li>
        ))}
      </ol>
      {images.length > 1 && <>
        <button type="button" className="gallery-previous" onClick={() => move(-1)} disabled={current === 0} aria-label="Foto anterior"><ChevronLeft /></button>
        <button type="button" className="gallery-next" onClick={() => move(1)} disabled={current === images.length - 1} aria-label="Próxima foto"><ChevronRight /></button>
        <p aria-live="polite">{current + 1} / {images.length}</p>
      </>}
    </section>
  );
}
