import { describe, expect, it } from "vitest";
import { buildDraftPath, normalizeImageOrder, validateImage } from "@/lib/properties/images";

describe("gestão de fotos", () => {
  it("recusa arquivos acima de 15 MB", () => {
    const file = new File([new Uint8Array(15 * 1024 * 1024 + 1)], "casa.jpg", { type: "image/jpeg" });
    expect(() => validateImage(file)).toThrow("15 MB");
  });
  it("recusa formatos não suportados", () => {
    expect(() => validateImage(new File(["x"], "casa.gif", { type: "image/gif" }))).toThrow("Formato");
  });
  it("cria um caminho seguro e determinístico com o UUID recebido", () => {
    expect(buildDraftPath("property-1", "Sala Principal.JPG", "uuid-1")).toBe("property-1/uuid-1-sala-principal.jpg");
  });
  it("gera posições sequenciais e rejeita IDs duplicados", () => {
    expect(normalizeImageOrder(["a", "b"])).toEqual([{ id: "a", position: 0 }, { id: "b", position: 1 }]);
    expect(() => normalizeImageOrder(["a", "a"])).toThrow("duplicados");
  });
});
