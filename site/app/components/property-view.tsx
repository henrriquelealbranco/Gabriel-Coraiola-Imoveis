import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, Building2, CarFront, Compass, MapPin, Ruler, Wallet } from "lucide-react";
import { BrandLockup } from "@/app/components/brand";
import { PropertyGallery } from "@/app/components/property-gallery";
import { SimilarProperties } from "@/app/components/similar-properties";
import { SiteFooter } from "@/app/components/site-footer";
import { WhatsAppCta } from "@/app/components/whatsapp-cta";
import { formatArea, formatCurrency, plural } from "@/lib/properties/format";
import type { Property } from "@/lib/properties/types";

export function PropertyView({ property, phone, similarProperties = [] }: { property: Property; phone: string; similarProperties?: Property[] }) {
  return <main className="conversion-page">
    <PropertyGallery images={property.images} title={property.title} />
    <header className="conversion-topbar">
      <Link href="/#imoveis" className="conversion-back"><ArrowLeft /> Ver todos os imóveis</Link>
      <Link href="/" aria-label="Gabriel Coraiola — Corretor de imóveis"><BrandLockup /></Link>
    </header>
    <div className="conversion-layout">
      <article className="conversion-details">
        <p className="eyebrow">{property.code} · Imóvel à venda</p>
        <h1>{property.title}</h1>
        <p className="conversion-location"><MapPin /> {property.neighborhood}, {property.city}</p>
        <strong className="conversion-price">{formatCurrency(property.price)}</strong>
        <dl className="conversion-facts">
          <Fact icon={<Ruler />} value={`${formatArea(property.areaM2)} m²`} label="área privativa" />
          <Fact icon={<BedDouble />} value={property.bedrooms} label={plural(property.bedrooms, "quarto", "quartos")} />
          <Fact icon={<Bath />} value={property.bathrooms} label={plural(property.bathrooms, "banheiro", "banheiros")} />
          <Fact icon={<CarFront />} value={property.parkingSpaces} label={plural(property.parkingSpaces, "vaga", "vagas")} />
          {property.sunPosition && <Fact icon={<Compass />} value={property.sunPosition} label="posição solar" />}
          {property.condoFee != null && <Fact icon={<Wallet />} value={formatCurrency(property.condoFee)} label="condomínio" />}
          {property.floorRange && <Fact icon={<Building2 />} value={property.floorRange} label="andar" />}
        </dl>
        <section className="conversion-description"><p className="eyebrow">Sobre o imóvel</p><h2>Detalhes que fazem diferença</h2><p>{property.description}</p></section>
      </article>
      <aside className="conversion-contact"><WhatsAppCta property={property} phone={phone} /></aside>
    </div>
    <SimilarProperties properties={similarProperties} />
    <SiteFooter />
    <div className="conversion-mobile-cta"><WhatsAppCta property={property} phone={phone} /></div>
  </main>;
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return <div>{icon}<dt>{value}</dt><dd>{label}</dd></div>;
}
