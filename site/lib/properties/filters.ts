import type { Property } from "@/lib/properties/types";

export const ALL_NEIGHBORHOODS = "all";

export function distinctNeighborhoods(properties: Property[]) {
  return Array.from(new Set(properties.map((property) => property.neighborhood))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export type CatalogFilters = { maxPrice: number; minBedrooms: number; neighborhood: string; code: string };

export function matchesCatalogFilters(property: Property, filters: CatalogFilters) {
  const codeQuery = filters.code.trim().toLowerCase();
  return (
    (filters.maxPrice === 0 || property.price <= filters.maxPrice) &&
    property.bedrooms >= filters.minBedrooms &&
    (filters.neighborhood === ALL_NEIGHBORHOODS || property.neighborhood === filters.neighborhood) &&
    (!codeQuery || property.code.toLowerCase().includes(codeQuery))
  );
}
