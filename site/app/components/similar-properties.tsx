import Link from "next/link";
import { Bath, BedDouble, Maximize2 } from "lucide-react";
import { formatArea, formatCurrency, photoAlt, plural } from "@/lib/properties/format";
import type { Property } from "@/lib/properties/types";

export function SimilarProperties({ properties }: { properties: Property[] }) {
  if (!properties.length) return null;
  return (
    <section className="similar-section" aria-label="Imóveis semelhantes">
      <div className="page-shell">
        <p className="eyebrow">Você também pode gostar</p>
        <h2>Imóveis semelhantes</h2>
        <div className="similar-grid">
          {properties.map((property) => {
            const image = property.images[0];
            return (
              <Link key={property.id} href={`/imovel/${property.slug}`} className="similar-card">
                {image
                  ? <img src={image.url} alt={photoAlt(property.title, 0)} loading="lazy" />
                  : <div className="property-image-placeholder">Fotos em breve</div>}
                <div className="similar-card-body">
                  <p className="eyebrow">{property.neighborhood} · {property.city}</p>
                  <h3>{property.title}</h3>
                  <div className="similar-facts">
                    <span><BedDouble /> {property.bedrooms} {plural(property.bedrooms, "quarto", "quartos")}</span>
                    <span><Bath /> {property.bathrooms} {plural(property.bathrooms, "banheiro", "banheiros")}</span>
                    <span><Maximize2 /> {formatArea(property.areaM2)} m²</span>
                  </div>
                  <strong>{formatCurrency(property.price)}</strong>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
