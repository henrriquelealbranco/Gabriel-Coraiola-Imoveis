"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { PropertyImage } from "@/lib/properties/types";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const rail = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);

  const move = (direction: -1 | 1) => {
    const next = Math.min(Math.max(current + direction, 0), images.length - 1);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.current?.scrollTo({ left: next * rail.current.clientWidth, behavior: reduced ? "auto" : "smooth" });
    setCurrent(next);
  };

  if (!images.length) return <section className="conversion-gallery gallery-empty" aria-label="Fotos do imóvel">Fotos em preparação</section>;

  return (
    <section className="conversion-gallery" aria-label="Fotos do imóvel">
      <ol ref={rail} onScroll={(event) => setCurrent(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}>
        {images.map((image, index) => (
          <li key={image.id}>
            <Image src={image.url} alt={image.altText || title} fill sizes="100vw" priority={index === 0} fetchPriority={index === 0 ? "high" : undefined} loading={index === 0 ? "eager" : "lazy"} />
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
