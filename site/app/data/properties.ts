export type Property = {
  id: "1" | "2" | "3";
  type: "Casa" | "Apartamento" | "Sobrado";
  featured?: boolean;
  title: string;
  neighborhood: string;
  city: "Curitiba";
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  image: string;
  imageAlt: string;
  summary: string;
};

export const properties: Property[] = [
  { id: "2", type: "Apartamento", featured: true, title: "Apartamento ensolarado no Batel", neighborhood: "Batel", city: "Curitiba", price: 760000, bedrooms: 3, bathrooms: 2, area: 118, parking: 2, image: "/images/apartamento-batel.png", imageAlt: "Sala contemporânea de apartamento no Batel", summary: "Planta inteligente, acabamento sofisticado e localização privilegiada." },
  { id: "1", type: "Casa", featured: true, title: "Casa contemporânea em condomínio", neighborhood: "Santa Felicidade", city: "Curitiba", price: 998000, bedrooms: 4, bathrooms: 4, area: 245, parking: 3, image: "/images/casa-condominio.png", imageAlt: "Casa contemporânea com jardim em condomínio", summary: "Ambientes integrados, jardim e excelente incidência de luz natural." },
  { id: "3", type: "Sobrado", title: "Sobrado novo e pronto para morar", neighborhood: "Água Verde", city: "Curitiba", price: 625000, bedrooms: 3, bathrooms: 3, area: 152, parking: 2, image: "/images/sobrado-agua-verde.png", imageAlt: "Sobrado contemporâneo com jardim", summary: "Projeto moderno, espaços generosos e uma área externa acolhedora." },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export const whatsappUrl = (propertyTitle?: string) => {
  const message = propertyTitle
    ? `Olá, Gabriel! Gostaria de saber mais sobre o imóvel: ${propertyTitle}.`
    : "Olá, Gabriel! Gostaria de encontrar um imóvel.";
  return `https://wa.me/5541999999999?text=${encodeURIComponent(message)}`;
};
