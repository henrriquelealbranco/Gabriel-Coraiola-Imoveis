import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PropertyView } from "@/app/components/property-view";
import type { Property } from "@/lib/properties/types";

const property: Property = {
  id: "2", code: "GC-002", slug: "apartamento-no-batel",
  title: "Apartamento ensolarado no Batel",
  description: "Planta inteligente, acabamento sofisticado e localização privilegiada.",
  price: 760000, city: "Curitiba", neighborhood: "Batel", address: null,
  bedrooms: 3, bathrooms: 2, parkingSpaces: 2, areaM2: 118, status: "active",
  images: [
    { id: "1", storagePath: "one.jpg", url: "/images/apartamento-batel.png", altText: "Sala", position: 0, width: 1200, height: 800 },
    { id: "2", storagePath: "two.jpg", url: "/images/casa-condominio.png", altText: "Varanda", position: 1, width: 1200, height: 800 },
  ],
};

describe("página pública do imóvel", () => {
  it("prioriza a galeria e mantém o contato personalizado visível", () => {
    const { container } = render(<PropertyView property={property} phone="5541999999999" />);
    expect(container.firstElementChild?.firstElementChild).toHaveAttribute("aria-label", "Fotos do imóvel");
    const images = screen.getAllByRole("img");
    expect(images[0]).toHaveAttribute("fetchpriority", "high");
    expect(images[1]).toHaveAttribute("loading", "lazy");
    expect(screen.getByText(/760\.000/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /clique aqui para receber mais informações/i })[0].getAttribute("href")).toContain("Apartamento%20ensolarado%20no%20Batel%2FGC-002");
  });
});
