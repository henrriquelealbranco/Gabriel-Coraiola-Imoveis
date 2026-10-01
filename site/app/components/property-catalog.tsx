"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bath, BedDouble, CarFront, Maximize2 } from "lucide-react";
import { formatPrice, whatsappUrl } from "@/app/data/properties";
import { formatArea, photoAlt, plural } from "@/lib/properties/format";
import { ALL_NEIGHBORHOODS, distinctNeighborhoods, matchesCatalogFilters } from "@/lib/properties/filters";
import type { Property } from "@/lib/properties/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// "0"/"all" significam sem filtro: com um teto fixo, imóveis fora dele nunca apareciam.
const initialFilters = { maxPrice: "0", bedrooms: "0", neighborhood: ALL_NEIGHBORHOODS, code: "" };

type FilterToolInput = { maxPrice?: number; minimumBedrooms?: number };

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

export function PropertyCatalog({ properties }: { properties: Property[] }) {
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice);
  const [bedrooms, setBedrooms] = useState(initialFilters.bedrooms);
  const [neighborhood, setNeighborhood] = useState(initialFilters.neighborhood);
  const [code, setCode] = useState(initialFilters.code);
  const filtersRef = useRef({ maxPrice, bedrooms });

  // Ordem alfabética, sem repetir: vem dos imóveis já carregados, não precisa de outra consulta.
  const neighborhoods = useMemo(() => distinctNeighborhoods(properties), [properties]);

  const filtered = useMemo(
    () => properties.filter((property) => matchesCatalogFilters(property, { maxPrice: Number(maxPrice), minBedrooms: Number(bedrooms), neighborhood, code })),
    [properties, maxPrice, bedrooms, neighborhood, code],
  );

  useEffect(() => {
    filtersRef.current = { maxPrice, bedrooms };
  }, [maxPrice, bedrooms]);

  useEffect(() => {
    if (!document.modelContext?.registerTool) return;
    const lifecycle = new AbortController();
    const allowedPrices = [0, 650000, 800000, 1000000];
    const allowedBedrooms = [0, 2, 3, 4];

    void Promise.resolve(document.modelContext.registerTool({
      name: "set_property_filters",
      title: "Filtrar imóveis",
      description: "Atualiza os filtros visíveis do catálogo por valor máximo (0 = qualquer valor) e quantidade mínima de quartos.",
      inputSchema: {
        type: "object",
        properties: {
          maxPrice: { type: "number", enum: allowedPrices },
          minimumBedrooms: { type: "number", enum: allowedBedrooms },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const next = input as FilterToolInput;
        if (next.maxPrice !== undefined && !allowedPrices.includes(next.maxPrice)) throw new Error("Valor máximo inválido.");
        if (next.minimumBedrooms !== undefined && !allowedBedrooms.includes(next.minimumBedrooms)) throw new Error("Quantidade de quartos inválida.");
        if (next.maxPrice !== undefined) setMaxPrice(String(next.maxPrice));
        if (next.minimumBedrooms !== undefined) setBedrooms(String(next.minimumBedrooms));
        const current = filtersRef.current;
        return { maxPrice: next.maxPrice ?? Number(current.maxPrice), minimumBedrooms: next.minimumBedrooms ?? Number(current.bedrooms) };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    return () => lifecycle.abort();
  }, []);

  const reset = () => {
    setMaxPrice(initialFilters.maxPrice);
    setBedrooms(initialFilters.bedrooms);
    setNeighborhood(initialFilters.neighborhood);
    setCode(initialFilters.code);
  };

  if (!properties.length) {
    return (
      <div className="empty-state">
        <h3>Novos imóveis chegando</h3>
        <p>A seleção está sendo atualizada. Conte o que você procura e receba as opções antes de irem para o site.</p>
        <a className="button button-dark" href={whatsappUrl()} target="_blank" rel="noreferrer">Contar o que procuro</a>
      </div>
    );
  }

  return (
    <div className="catalog" aria-label="Catálogo de imóveis">
      <div className="filter-bar">
        <Filter label="Valor máximo">
          <Select value={maxPrice} onValueChange={setMaxPrice}>
            <SelectTrigger aria-label="Valor máximo" className="filter-trigger"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="0">Qualquer valor</SelectItem><SelectItem value="650000">Até R$ 650 mil</SelectItem><SelectItem value="800000">Até R$ 800 mil</SelectItem><SelectItem value="1000000">Até R$ 1 milhão</SelectItem></SelectContent>
          </Select>
        </Filter>
        <Filter label="Bairro">
          <Select value={neighborhood} onValueChange={setNeighborhood}>
            <SelectTrigger aria-label="Bairro" className="filter-trigger"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_NEIGHBORHOODS}>Todos os bairros</SelectItem>
              {neighborhoods.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Filter>
        <Filter label="Quartos">
          <Select value={bedrooms} onValueChange={setBedrooms}>
            <SelectTrigger aria-label="Quartos" className="filter-trigger"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="0">Qualquer quantidade</SelectItem><SelectItem value="2">2 ou mais</SelectItem><SelectItem value="3">3 ou mais</SelectItem><SelectItem value="4">4 ou mais</SelectItem></SelectContent>
          </Select>
        </Filter>
        <Filter label="Código do imóvel">
          <input
            className="filter-input"
            type="search"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Ex.: AP01"
            aria-label="Buscar por código do imóvel"
          />
        </Filter>
        <p className="result-count" aria-live="polite"><strong>{filtered.length}</strong> {plural(filtered.length, "imóvel encontrado", "imóveis encontrados")}</p>
      </div>

      {filtered.length ? (
        <div className="property-grid">
          {filtered.map((property, index) => {
            const image = property.images[0];
            return (
              <article className="property-card" key={property.id}>
                <Link className="property-image-link" href={`/imovel/${property.slug}`} aria-label={`Ver detalhes de ${property.title}`}>
                  {image
                    ? <img src={image.url} alt={photoAlt(property.title, 0)} width={1200} height={800} loading={index === 0 ? "eager" : "lazy"} decoding="async" />
                    : <div className="property-image-placeholder">Fotos em breve</div>}
                  {property.images.length > 1 && <span className="photo-count">{property.images.length} fotos</span>}
                </Link>
                <div className="property-card-body">
                  <p className="eyebrow property-meta"><span>{property.neighborhood} · {property.city}</span></p>
                  <h3><Link href={`/imovel/${property.slug}`}>{property.title}</Link></h3>
                  <dl className="property-facts" aria-label="Características do imóvel">
                    <Fact icon={<BedDouble />} value={property.bedrooms} label={plural(property.bedrooms, "quarto", "quartos")} />
                    <Fact icon={<Bath />} value={property.bathrooms} label={plural(property.bathrooms, "banheiro", "banheiros")} />
                    <Fact icon={<Maximize2 />} value={formatArea(property.areaM2)} label="m²" />
                    <Fact icon={<CarFront />} value={property.parkingSpaces} label={plural(property.parkingSpaces, "vaga", "vagas")} />
                  </dl>
                  <div className="property-card-footer">
                    <div><span>Valor de venda</span><strong>{formatPrice(property.price)}</strong></div>
                    <div className="card-actions"><Link href={`/imovel/${property.slug}`}>Ver detalhes <ArrowUpRight /></Link><a href={whatsappUrl(property.title)} target="_blank" rel="noreferrer">Consultar</a></div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state"><h3>Nenhum imóvel com esses filtros</h3><p>Ajuste o valor, o bairro, os quartos ou o código para ver outras opções.</p><button type="button" onClick={reset}>Limpar filtros</button></div>
      )}
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="filter-field"><span>{label}</span>{children}</div>;
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return <div>{icon}<dt>{value}</dt><dd>{label}</dd></div>;
}
