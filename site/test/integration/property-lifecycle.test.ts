import { describe, expect, it } from "vitest";
import { canPublishProperty, isPublicProperty } from "@/lib/properties/lifecycle";

describe("ciclo de publicação do imóvel", () => {
  it("só publica imóvel ativo com foto e remove vendidos da consulta pública", () => {
    expect(canPublishProperty({ status: "inactive", imageCount: 2 })).toBe(false);
    expect(canPublishProperty({ status: "active", imageCount: 0 })).toBe(false);
    expect(canPublishProperty({ status: "active", imageCount: 2 })).toBe(true);
    expect(isPublicProperty("active")).toBe(true);
    expect(isPublicProperty("sold")).toBe(false);
  });
});
