import { properties as legacyProperties } from "@/app/data/properties";
import type { Property } from "@/lib/properties/types";

const slugs: Record<string, string> = {
  "1": "casa-contemporanea-santa-felicidade",
  "2": "apartamento-ensolarado-batel",
  "3": "sobrado-novo-agua-verde",
};

export const sampleProperties: Property[] = legacyProperties.map((property) => ({
  id: property.id,
  code: `GC-00${property.id}`,
  slug: slugs[property.id],
  title: property.title,
  description: `${property.summary} Entre em contato para conhecer todos os detalhes e agendar uma visita com atendimento direto e personalizado.`,
  price: property.price,
  city: property.city,
  neighborhood: property.neighborhood,
  address: null,
  bedrooms: property.bedrooms,
  bathrooms: property.bathrooms,
  parkingSpaces: property.parking,
  areaM2: property.area,
  status: "active",
  images: [{ id: `${property.id}-1`, storagePath: property.image, url: property.image, altText: property.imageAlt, position: 0, width: 1600, height: 1100 }],
}));

export const findSamplePropertyBySlug = (slug: string) => sampleProperties.find((property) => property.slug === slug) ?? null;
export const findSamplePropertyById = (id: string) => sampleProperties.find((property) => property.id === id) ?? null;
