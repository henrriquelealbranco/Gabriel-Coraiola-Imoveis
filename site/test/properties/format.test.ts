import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/properties/format";

describe("formatação de imóveis", () => {
  it("formata valores em reais sem centavos", () => {
    expect(formatCurrency(760000)).toBe("R$ 760.000");
  });

  it("gera uma mensagem personalizada para o WhatsApp", () => {
    const url = buildWhatsAppUrl(
      { title: "Apartamento no Batel", code: "GC-002" },
      "5541999999999",
    );

    expect(decodeURIComponent(url)).toContain(
      "Olá, vi o imóvel Apartamento no Batel/GC-002 e quero agendar uma visita.",
    );
  });
});
