"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, CarFront, Maximize2 } from "lucide-react";
import { properties, formatPrice, whatsappUrl } from "@/app/data/properties";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialFilters = { type: "Todos", maxPrice: "1000000", bedrooms: "0" };

type FilterToolInput = { type?: string; maxPrice?: number; minimumBedrooms?: number };

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        title: string;
        description: string;
        inputSchema: object;
        annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
        execute: (input: unknown) => unknown;
      }, options?: { signal?: AbortSignal }) => void | Promise<void>;
    };
  }
}

export function PropertyCatalog() {
  const [type, setType] = useState(initialFilters.type);
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms);
  const filtersRef = useRef({ type, maxPrice, bedrooms });
  const filtered = useMemo(() => properties.filter((property) =>
    (type === "Todos" || property.type === type) &&
    property.price <= Number(maxPrice) &&
    property.bedrooms >= Number(bedrooms)
  ), [type, maxPrice, bedrooms]);

  useEffect(() => {
    filtersRef.current = { type, maxPrice, bedrooms };
  }, [type, maxPrice, bedrooms]);

  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const allowedTypes = ["Todos", "Casa", "Apartamento", "Sobrado"];
    const allowedPrices = [650000, 800000, 1000000];
    const allowedBedrooms = [0, 2, 3, 4];

    void Promise.resolve(document.modelContext.registerTool({
      name: "set_property_filters",
      title: "Filtrar imóveis",
      description: "Atualiza os filtros visíveis do catálogo por tipo, valor máximo e quantidade mínima de quartos.",
      inputSchema: {
        type: "object",
        properties: {
          type: { type: "string", enum: allowedTypes },
          maxPrice: { type: "number", enum: allowedPrices },
          minimumBedrooms: { type: "number", enum: allowedBedrooms },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const next = input as FilterToolInput;
        if (next.type !== undefined && !allowedTypes.includes(next.type)) throw new Error("Tipo de imóvel inválido.");
        if (next.maxPrice !== undefined && !allowedPrices.includes(next.maxPrice)) throw new Error("Valor máximo inválido.");
        if (next.minimumBedrooms !== undefined && !allowedBedrooms.includes(next.minimumBedrooms)) throw new Error("Quantidade de quartos inválida.");
        if (next.type !== undefined) setType(next.type);
        if (next.maxPrice !== undefined) setMaxPrice(String(next.maxPrice));
        if (next.minimumBedrooms !== undefined) setBedrooms(String(next.minimumBedrooms));
        const current = filtersRef.current;
        return { type: next.type ?? current.type, maxPrice: next.maxPrice ?? Number(current.maxPrice), minimumBedrooms: next.minimumBedrooms ?? Number(current.bedrooms) };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    return () => lifecycle.abort();
  }, []);

  const reset = () => {
    setType(initialFilters.type);
    setMaxPrice(initialFilters.maxPrice);
    setBedrooms(initialFilters.bedrooms);
  };

  return (
    <div className="catalog" aria-label="Catálogo de imóveis">
      <div className="filter-bar">
        <Filter label="Tipo de imóvel">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Tipo de imóvel" className="filter-trigger"><SelectValue /></SelectTrigger>
            <SelectContent>{["Todos", "Casa", "Apartamento", "Sobrado"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
          </Select>
        </Filter>
        <Filter label="Valor máximo">
          <Select value={maxPrice} onValueChange={setMaxPrice}>
            <SelectTrigger aria-label="Valor máximo" className="filter-trigger"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="650000">Até R$ 650 mil</SelectItem><SelectItem value="800000">Até R$ 800 mil</SelectItem><SelectItem value="1000000">Até R$ 1 milhão</SelectItem></SelectContent>
          </Select>
        </Filter>
        <Filter label="Quartos">
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger aria-label="Quartos" className="filter-trigger"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="0">Qualquer quantidade</SelectItem><SelectItem value="2">2 ou mais</SelectItem><SelectItem value="3">3 ou mais</SelectItem><SelectItem value="4">4 ou mais</SelectItem></SelectContent>
          </Select>
        </Filter>
        <p className="result-count" aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}</p>
      </div>

      {filtered.length ? (
        <div className="property-grid">
          {filtered.map((property) => (
            <article className="property-card" key={property.id}>
              <Link className="property-image-link" href={`/imoveis/${property.id}`} aria-label={`Ver detalhes de ${property.title}`}>
                <img src={property.image} alt={property.imageAlt} /><span className="image-index">0{property.id}</span>
              </Link>
              <div className="property-card-body">
                <p className="eyebrow property-meta">{property.type}{property.featured ? "  Destaque" : ""}<span>{property.neighborhood} · {property.city}</span></p>
                <h3><Link href={`/imoveis/${property.id}`}>{property.title}</Link></h3>
                <dl className="property-facts" aria-label="Características do imóvel">
                  <Fact icon={<BedDouble />} value={property.bedrooms} label="quartos" />
                  <Fact icon={<Bath />} value={property.bathrooms} label="banheiros" />
                  <Fact icon={<Maximize2 />} value={property.area} label="m²" />
                  <Fact icon={<CarFront />} value={property.parking} label="vagas" />
                </dl>
                <div className="property-card-footer">
                  <div><span>Valor de venda</span><strong>{formatPrice(property.price)}</strong></div>
                  <div className="card-actions"><Link href={`/imoveis/${property.id}`}>Ver detalhes <ArrowUpRight /></Link><a href={whatsappUrl(property.title)} target="_blank" rel="noreferrer">Consultar</a></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><h3>Nenhum imóvel encontrado</h3><p>Ajuste os filtros para ver outras opções.</p><button type="button" onClick={reset}>Limpar filtros</button></div>
      )}
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="filter-field"><span>{label}</span>{children}</div>;
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div>{icon}<dt>{value}</dt><dd>{label}</dd></div>;
}
