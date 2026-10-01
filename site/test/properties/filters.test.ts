import { describe, expect, it } from "vitest";
import { distinctNeighborhoods, matchesCatalogFilters } from "@/lib/properties/filters";
import type { Property } from "@/lib/properties/types";

function property(overrides: Partial<Property>): Property {
  return {
    id: "1", code: "AP01", slug: "ap01", title: "Apartamento", description: "Descrição com mais de vinte letras.",
    price: 700000, city: "Curitiba", neighborhood: "Batel", address: null,
    bedrooms: 2, bathrooms: 1, parkingSpaces: 1, areaM2: 80, status: "active", images: [],
    ...overrides,
  };
}

describe("filtro por bairro", () => {
  it("lista os bairros únicos em ordem alfabética", () => {
    const properties = [property({ neighborhood: "Água Verde" }), property({ neighborhood: "Batel" }), property({ neighborhood: "Batel" })];
    expect(distinctNeighborhoods(properties)).toEqual(["Água Verde", "Batel"]);
  });

  it("'all' não filtra por bairro nenhum", () => {
    const property1 = property({ neighborhood: "Batel" });
    expect(matchesCatalogFilters(property1, { maxPrice: 0, minBedrooms: 0, neighborhood: "all", code: "" })).toBe(true);
  });

  it("um bairro escolhido exclui os outros", () => {
    const batel = property({ neighborhood: "Batel" });
    const aguaVerde = property({ neighborhood: "Água Verde" });
    const filters = { maxPrice: 0, minBedrooms: 0, neighborhood: "Batel", code: "" };
    expect(matchesCatalogFilters(batel, filters)).toBe(true);
    expect(matchesCatalogFilters(aguaVerde, filters)).toBe(false);
  });
});

describe("busca por código do imóvel", () => {
  it("ignora maiúsculas/minúsculas e casa por substring", () => {
    const ap01 = property({ code: "AP01" });
    const filters = { maxPrice: 0, minBedrooms: 0, neighborhood: "all", code: "ap0" };
    expect(matchesCatalogFilters(ap01, filters)).toBe(true);
  });

  it("código que não bate exclui o imóvel", () => {
    const ap01 = property({ code: "AP01" });
    const filters = { maxPrice: 0, minBedrooms: 0, neighborhood: "all", code: "SO01" };
    expect(matchesCatalogFilters(ap01, filters)).toBe(false);
  });

  it("combina com os demais filtros (E, não OU)", () => {
    const property1 = property({ code: "AP01", neighborhood: "Batel", price: 900000 });
    const filters = { maxPrice: 800000, minBedrooms: 0, neighborhood: "Batel", code: "ap01" };
    expect(matchesCatalogFilters(property1, filters)).toBe(false);
  });
});
