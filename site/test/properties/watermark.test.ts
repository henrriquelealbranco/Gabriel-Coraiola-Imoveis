import { describe, expect, it } from "vitest";
import { buildDraftPath } from "@/lib/properties/images";
import { hasWatermark, watermarkSvg } from "@/lib/properties/watermark";

describe("marca d'água", () => {
  it("centraliza a marca com tamanho proporcional à foto", () => {
    const svg = watermarkSvg(2400, 1800);
    expect(svg).toContain('width="2400" height="1800"');
    expect(svg).toMatch(/translate\(\d+ \d+\) scale\(/);
  });

  it("reconhece fotos já marcadas pelo nome para nunca aplicar duas vezes", () => {
    expect(hasWatermark(buildDraftPath("p1", "IMG_1234-wm.jpg", "u1"))).toBe(true);
    expect(hasWatermark(buildDraftPath("p1", "IMG_1234.jpg", "u1"))).toBe(false);
  });
});
