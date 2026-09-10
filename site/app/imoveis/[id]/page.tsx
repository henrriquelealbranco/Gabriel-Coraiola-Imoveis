import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { formatPrice, properties, whatsappUrl } from "@/app/data/properties";

export function generateStaticParams() {
  return properties.map((property) => ({ id: property.id }));
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = properties.find((item) => item.id === id);
  if (!property) notFound();

  return (
    <main className="detail-page">
      <section className="detail-hero">
        <img src={property.image} alt={property.imageAlt} />
        <header className="detail-nav page-shell">
          <Link className="brand" href="/" aria-label="Voltar para Gabriel Coraiola Imóveis"><span className="brand-mark">GC</span><span><strong>Gabriel Coraiola</strong><small>Corretor de imóveis</small></span></Link>
          <Link className="back-link" href="/#imoveis"><ArrowLeft /> Voltar aos imóveis</Link>
        </header>
        <div className="detail-heading page-shell">
          <p className="eyebrow">{property.type} · À venda</p>
          <h1>{property.title}</h1>
          <p className="location">{property.neighborhood} · {property.city}</p>
        </div>
      </section>

      <section className="detail-body page-shell">
        <div className="detail-summary">
          <div>
            <div className="price-box"><span>Valor de venda</span><strong>{formatPrice(property.price)}</strong><span>Consulte as condições</span></div>
            <div className="detail-facts" aria-label="Características do imóvel">
              <DetailFact value={property.area} label="m² privativos" />
              <DetailFact value={property.bedrooms} label="quartos" />
              <DetailFact value={property.bathrooms} label="banheiros" />
              <DetailFact value={property.parking} label="vagas" />
            </div>
          </div>
          <div className="detail-copy">
            <p className="eyebrow">Sobre este imóvel</p>
            <h2>Conforto, localização e uma excelente escolha para viver bem.</h2>
            <p>{property.summary}</p>
            <p>Entre em contato para receber mais informações, conhecer todos os detalhes e agendar uma visita com atendimento personalizado.</p>
          </div>
        </div>

        <div className="agent-card">
          <span className="brand-mark">GC</span>
          <div><p className="eyebrow">Atendimento direto com</p><h2>Gabriel Coraiola</h2><p>Tire suas dúvidas e agende uma visita a este imóvel.</p></div>
          <a className="button" href={whatsappUrl(property.title)} target="_blank" rel="noreferrer">Conversar no WhatsApp <ArrowUpRight /></a>
        </div>
      </section>

      <section className="visit-cta"><div className="page-shell"><p className="eyebrow">Gostou deste imóvel?</p><h2>Vamos agendar uma visita.</h2><a className="button button-light" href={whatsappUrl(property.title)} target="_blank" rel="noreferrer">Falar com Gabriel <ArrowUpRight /></a></div></section>
    </main>
  );
}

function DetailFact({ value, label }: { value: number; label: string }) {
  return <div className="detail-fact"><strong>{value}</strong><span>{label}</span></div>;
}
