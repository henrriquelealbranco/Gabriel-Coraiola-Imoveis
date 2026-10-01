import { describe, expect, it } from "vitest";
import { propertyFormSchema } from "@/lib/properties/schema";

const validProperty = {
  code: "GC-002",
  slug: "apartamento-no-batel",
  title: "Apartamento ensolarado no Batel",
  description: "Planta inteligente, acabamento sofisticado e localização privilegiada.",
  price: "760000",
  city: "Curitiba",
  neighborhood: "Batel",
  address: "",
  bedrooms: "3",
  bathrooms: "2",
  parkingSpaces: "2",
  areaM2: "118",
  status: "active",
};

describe("validação do cadastro de imóvel", () => {
  it.each([
    ["title", ""],
    ["slug", "Apartamento no Batel"],
    ["price", "-1"],
  ])("rejeita o campo %s inválido", (field, value) => {
    const result = propertyFormSchema.safeParse({ ...validProperty, [field]: value });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors[field as keyof typeof errors]).toBeDefined();
    }
  });

  it("converte números e endereço vazio corretamente", () => {
    const result = propertyFormSchema.parse(validProperty);
    expect(result).toMatchObject({ price: 760000, bedrooms: 3, areaM2: 118, address: null });
  });

  it("destaques adicionais são opcionais e viram null quando vazios", () => {
    const result = propertyFormSchema.parse({ ...validProperty, sunPosition: "", condoFee: "", floorRange: "" });
    expect(result).toMatchObject({ sunPosition: null, condoFee: null, floorRange: null });
  });

  it("aceita os destaques adicionais quando informados", () => {
    const result = propertyFormSchema.parse({ ...validProperty, sunPosition: "Nascente", condoFee: "450.90", floorRange: "do 4º ao 6º andar" });
    expect(result).toMatchObject({ sunPosition: "Nascente", condoFee: 450.9, floorRange: "do 4º ao 6º andar" });
  });

  it("rejeita taxa de condomínio negativa ou não numérica", () => {
    expect(propertyFormSchema.safeParse({ ...validProperty, condoFee: "-10" }).success).toBe(false);
    expect(propertyFormSchema.safeParse({ ...validProperty, condoFee: "abc" }).success).toBe(false);
  });
});
