import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, CarFront, MapPin, Ruler } from "lucide-react";
import { PropertyGallery } from "@/app/components/property-gallery";
import { WhatsAppCta } from "@/app/components/whatsapp-cta";
import { formatCurrency } from "@/lib/properties/format";
import type { Property } from "@/lib/properties/types";

export function PropertyView({ property, phone }: { property: Property; phone: string }) {
  return <main className="conversion-page">
    <PropertyGallery images={property.images} title={property.title} />
    <header className="conversion-topbar"><Link href="/#imoveis"><ArrowLeft /> Ver todos os imóveis</Link><span className="brand-mark">GC</span></header>
    <div className="conversion-layout">
      <article className="conversion-details">
        <p className="eyebrow">{property.code} · Imóvel à venda</p>
        <h1>{property.title}</h1>
        <p className="conversion-location"><MapPin /> {property.neighborhood}, {property.city}</p>
        <strong className="conversion-price">{formatCurrency(property.price)}</strong>
        <dl className="conversion-facts">
          <Fact icon={<Ruler />} value={`${property.areaM2} m²`} label="área privativa" />
          <Fact icon={<BedDouble />} value={property.bedrooms} label="quartos" />
          <Fact icon={<Bath />} value={property.bathrooms} label="banheiros" />
          <Fact icon={<CarFront />} value={property.parkingSpaces} label="vagas" />
        </dl>
        <section className="conversion-description"><p className="eyebrow">Sobre o imóvel</p><h2>Detalhes que fazem diferença.</h2><p>{property.description}</p></section>
      </article>
      <aside className="conversion-contact"><p>Atendimento direto</p><h2>Gabriel Coraiola</h2><span>Receba mais informações e escolha o melhor horário para visitar.</span><WhatsAppCta property={property} phone={phone} /></aside>
    </div>
    <div className="conversion-mobile-cta"><WhatsAppCta property={property} phone={phone} /></div>
  </main>;
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return <div>{icon}<dt>{value}</dt><dd>{label}</dd></div>;
}
