import { notFound } from "next/navigation";
import { permanentRedirect } from "next/navigation";
import { sampleProperties, findSamplePropertyById } from "@/lib/properties/sample";

export function generateStaticParams() {
  return sampleProperties.map((property) => ({ id: property.id }));
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = findSamplePropertyById(id);
  if (!property) notFound();
  permanentRedirect(`/imovel/${property.slug}`);
}
