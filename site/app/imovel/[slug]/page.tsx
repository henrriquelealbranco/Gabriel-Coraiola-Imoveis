export const dynamic = "force-dynamic";

import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyView } from "@/app/components/property-view";
import { findSamplePropertyBySlug } from "@/lib/properties/sample";
import { getActivePropertyBySlug, listSimilarProperties } from "@/lib/properties/repository";
import { formatCurrency, plural } from "@/lib/properties/format";

import { SUPABASE_URL } from "@/lib/supabase/config";

const loadProperty = cache(async (slug: string) => {
  const configured = Boolean(SUPABASE_URL);
  return configured ? getActivePropertyBySlug(slug) : findSamplePropertyBySlug(slug);
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) return { title: "Imóvel não encontrado · Gabriel Coraiola Imóveis" };
  const title = `${property.title} · ${property.neighborhood}, ${property.city}`;
  const description = `${formatCurrency(property.price)} · ${property.bedrooms} ${plural(property.bedrooms, "quarto", "quartos")} · ${property.areaM2} m². ${property.description}`.slice(0, 160);
  const cover = property.images[0]?.url;
  return {
    title: `${title} · Gabriel Coraiola Imóveis`,
    description,
    alternates: { canonical: `/imovel/${property.slug}` },
    openGraph: { type: "website", locale: "pt_BR", title, description, images: cover ? [{ url: cover }] : undefined },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await loadProperty(slug);
  if (!property) notFound();
  const configured = Boolean(SUPABASE_URL);
  const similarProperties = configured ? await listSimilarProperties(property) : [];
  return <PropertyView property={property} phone={process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5541992382865"} similarProperties={similarProperties} />;
}
