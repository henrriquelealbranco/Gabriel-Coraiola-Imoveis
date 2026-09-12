import { notFound } from "next/navigation";
import { PropertyView } from "@/app/components/property-view";
import { findSamplePropertyBySlug, sampleProperties } from "@/lib/properties/sample";
import { getActivePropertyBySlug } from "@/lib/properties/repository";

export function generateStaticParams() { return sampleProperties.map(({ slug }) => ({ slug })); }

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const property = configured ? await getActivePropertyBySlug(slug) : findSamplePropertyBySlug(slug);
  if (!property) notFound();
  return <PropertyView property={property} phone={process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "5541999999999"} />;
}
