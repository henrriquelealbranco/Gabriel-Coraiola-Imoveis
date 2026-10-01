import { describe, expect, it, vi } from "vitest";
import { getActivePropertyBySlug, listActiveProperties, listSimilarProperties } from "@/lib/properties/repository";
import { parsePropertyForm } from "@/lib/properties/form";
import { photoAlt, plural } from "@/lib/properties/format";

const row = {
  id: "p1", code: "GC-1", slug: "casa", title: "Casa no Batel", description: "Descrição com mais de vinte letras.",
  price: 900000, city: "Curitiba", neighborhood: "Batel", address: null,
  bedrooms: 3, bathrooms: 2, parking_spaces: 2, area_m2: 120, status: "active",
  property_images: [
    { id: "b", storage_path: "p1/b.jpg", public_url: "https://x/p1/b.jpg", alt_text: "", position: 1 },
    { id: "draft", storage_path: "p1/draft.jpg", public_url: null, alt_text: "", position: 0 },
    { id: "a", storage_path: "p1/a.jpg", public_url: "https://x/p1/a.jpg", alt_text: "", position: 0 },
  ],
};

function clientReturning(data: unknown, error: unknown = null) {
  const order = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  return { from: vi.fn(() => ({ select })) } as never;
}

describe("fotos no site público", () => {
  it("nunca expõe foto sem URL pública e ordena pela posição", async () => {
    const [property] = await listActiveProperties(clientReturning([row]));
    expect(property.images.map((image) => image.id)).toEqual(["a", "b"]);
    expect(property.images.every((image) => image.url.startsWith("https://"))).toBe(true);
  });

  it("devolve vitrine vazia em vez de quebrar a home quando o banco falha", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(listActiveProperties(clientReturning(null, new Error("timeout")))).resolves.toEqual([]);
    spy.mockRestore();
  });

  it("descreve a foto pelo imóvel, não pelo nome do arquivo", () => {
    expect(photoAlt("Casa no Batel", 0)).toBe("Casa no Batel — foto 1");
  });

  it("traz os destaques adicionais quando existem, e null quando não", async () => {
    const [withExtras] = await listActiveProperties(clientReturning([{ ...row, sun_position: "Nascente", condo_fee: "450.90", floor_range: "do 4º ao 6º andar" }]));
    expect(withExtras).toMatchObject({ sunPosition: "Nascente", condoFee: 450.9, floorRange: "do 4º ao 6º andar" });
    const [withoutExtras] = await listActiveProperties(clientReturning([row]));
    expect(withoutExtras).toMatchObject({ sunPosition: null, condoFee: null, floorRange: null });
  });
});

describe("imóveis semelhantes", () => {
  const near = { ...row, id: "same-neighborhood", code: "GC-2", neighborhood: "Batel", city: "Curitiba" };
  const sameCity = { ...row, id: "same-city", code: "GC-3", neighborhood: "Água Verde", city: "Curitiba" };
  const farAway = { ...row, id: "far-away", code: "GC-4", neighborhood: "Outro bairro", city: "Outra cidade" };

  it("prioriza o mesmo bairro, depois a mesma cidade, e exclui o próprio imóvel", async () => {
    const limit = vi.fn().mockResolvedValue({ data: [farAway, sameCity, near], error: null });
    const chain = { eq: vi.fn(() => chain), neq: vi.fn(() => chain), order: vi.fn(() => ({ limit })) };
    const client = { from: vi.fn(() => ({ select: vi.fn(() => chain) })) } as never;

    const result = await listSimilarProperties({ id: "p1", neighborhood: "Batel", city: "Curitiba" }, 3, client);

    expect(result.map((property) => property.id)).toEqual(["same-neighborhood", "same-city", "far-away"]);
  });

  it("nunca quebra a página do imóvel se a busca por semelhantes falhar", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const chain = { eq: vi.fn(() => chain), neq: vi.fn(() => chain), order: vi.fn(() => ({ limit: vi.fn().mockResolvedValue({ data: null, error: new Error("timeout") }) })) };
    const client = { from: vi.fn(() => ({ select: vi.fn(() => chain) })) } as never;
    await expect(listSimilarProperties({ id: "p1", neighborhood: "Batel", city: "Curitiba" }, 3, client)).resolves.toEqual([]);
    spy.mockRestore();
  });
});

describe("página do imóvel", () => {
  function slugClient(results: { data: unknown; error: unknown }[]) {
    const single = vi.fn();
    results.forEach((result) => single.mockResolvedValueOnce(result));
    const chain = { eq: vi.fn(() => chain), order: vi.fn(() => ({ single })) };
    return { client: { from: vi.fn(() => ({ select: vi.fn(() => chain) })) } as never, single };
  }

  it("só diz que não existe quando o banco confirma que não há imóvel", async () => {
    const { client } = slugClient([{ data: null, error: { code: "PGRST116", message: "0 rows" } }]);
    await expect(getActivePropertyBySlug("x", client)).resolves.toBeNull();
  });

  it("tenta de novo numa falha passageira em vez de mostrar 'não encontrado'", async () => {
    const { client, single } = slugClient([{ data: null, error: { code: "503", message: "timeout" } }, { data: row, error: null }]);
    const property = await getActivePropertyBySlug("casa", client);
    expect(single).toHaveBeenCalledTimes(2);
    expect(property?.title).toBe("Casa no Batel");
  });
});

describe("textos e cadastro", () => {
  it("concorda o plural com a quantidade", () => {
    expect(plural(1, "quarto", "quartos")).toBe("quarto");
    expect(plural(0, "quarto", "quartos")).toBe("quartos");
    expect(plural(3, "quarto", "quartos")).toBe("quartos");
  });

  it("gera o endereço da página a partir do título quando ele fica em branco", () => {
    const form = new FormData();
    Object.entries({ code: "GC-9", slug: "", title: "Apartamento no Água Verde", description: "Apartamento amplo com sacada e vista livre.", price: "650000", city: "Curitiba", neighborhood: "Água Verde", address: "", bedrooms: "2", bathrooms: "1", parkingSpaces: "1", areaM2: "72.5" })
      .forEach(([key, value]) => form.set(key, value));
    const result = parsePropertyForm(form);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.slug).toBe("apartamento-no-agua-verde");
      expect(result.data.areaM2).toBe(72.5);
    }
  });
});
