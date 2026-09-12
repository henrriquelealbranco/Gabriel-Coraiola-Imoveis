import { notFound } from "next/navigation";
import { PropertyForm } from "@/app/admin/components/property-form";
import { ImageManager } from "@/app/admin/components/image-manager";
import { updateProperty } from "@/app/admin/imoveis/actions";
import { getAdminPropertyById } from "@/lib/properties/repository";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const property = await getAdminPropertyById(id); if (!property) notFound();
  return <main className="admin-shell admin-editor"><p className="eyebrow">{property.code}</p><h1>Editar imóvel</h1><PropertyForm property={property} action={updateProperty.bind(null, id)} /><ImageManager propertyId={id} images={property.images} /></main>;
}
