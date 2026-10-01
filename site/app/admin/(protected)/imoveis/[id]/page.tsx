export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/app/admin/components/property-form";
import { ImageManager } from "@/app/admin/components/image-manager";
import { PublishPanel } from "@/app/admin/components/publish-panel";
import { DeleteProperty } from "@/app/admin/components/delete-property";
import { updateProperty } from "@/app/admin/imoveis/actions";
import { getAdminPropertyById } from "@/lib/properties/repository";

export default async function EditPropertyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  const { id } = await params;
  const { novo } = await searchParams;
  const property = await getAdminPropertyById(id);
  if (!property) notFound();

  const justCreated = novo === "1" && property.status === "inactive";
  const gallery = <ImageManager propertyId={id} images={property.images} />;
  const form = <PropertyForm key={property.id} property={property} action={updateProperty.bind(null, id)} />;

  return (
    <main className="admin-shell admin-editor">
      <Link className="admin-back" href="/admin/imoveis"><ArrowLeft /> Todos os imóveis</Link>
      <p className="eyebrow">{justCreated ? "Novo cadastro · passo 2 de 2" : property.code}</p>
      <h1>{justCreated ? "Fotos e publicação" : property.title}</h1>
      {justCreated && (
        <p className="admin-banner" role="status">
          Imóvel cadastrado. Envie as fotos e depois clique em <strong>Publicar no site</strong>.
        </p>
      )}
      <PublishPanel id={id} slug={property.slug} status={property.status} imageCount={property.images.length} />
      {justCreated ? <>{gallery}{form}</> : <>{form}{gallery}</>}
      <DeleteProperty id={id} title={property.title} />
    </main>
  );
}
