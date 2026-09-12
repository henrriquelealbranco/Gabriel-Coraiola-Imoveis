import { describe, expect, it, vi } from "vitest";
import { getActivePropertyBySlug } from "@/lib/properties/repository";

describe("consulta pública de imóveis", () => {
  it("filtra pelo slug e pelo status ativo e ordena as fotos", async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: null });
    const order = vi.fn(() => ({ single }));
    const eqStatus = vi.fn(() => ({ order }));
    const eqSlug = vi.fn(() => ({ eq: eqStatus }));
    const select = vi.fn(() => ({ eq: eqSlug }));
    const from = vi.fn(() => ({ select }));

    await getActivePropertyBySlug("apartamento-no-batel", { from } as never);

    expect(eqSlug).toHaveBeenCalledWith("slug", "apartamento-no-batel");
    expect(eqStatus).toHaveBeenCalledWith("status", "active");
    expect(order).toHaveBeenCalledWith("position", { foreignTable: "property_images", ascending: true });
  });
});
