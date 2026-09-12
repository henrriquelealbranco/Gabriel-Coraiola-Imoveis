import { describe, expect, it } from "vitest";
import { parsePropertyForm } from "@/lib/properties/form";

describe("ações de imóveis", () => {
  it("mantém os nomes dos campos ao retornar erros de validação", () => {
    const form = new FormData();
    form.set("title", "");
    const result = parsePropertyForm(form);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.title).toBeDefined();
  });
});
