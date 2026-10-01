import type { Property } from "@/lib/properties/types";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export const formatArea = (value: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);

export const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

export const photoAlt = (title: string, index: number) => `${title} — foto ${index + 1}`;

export function buildWhatsAppUrl(
  property: Pick<Property, "title" | "code">,
  phone: string,
) {
  const digits = phone.replace(/\D/g, "");
  const text = `Olá, vi o imóvel ${property.title}/${property.code} e quero agendar uma visita.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
