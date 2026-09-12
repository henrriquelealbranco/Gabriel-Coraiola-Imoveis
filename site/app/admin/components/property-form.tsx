import type { Property } from "@/lib/properties/types";

export function PropertyForm({ property, action }: { property?: Property; action: (formData: FormData) => void | Promise<void> }) {
  return <form action={action} className="property-form">
    <div className="form-grid"><Field name="code" label="Código" defaultValue={property?.code} required /><Field name="slug" label="Endereço da página" defaultValue={property?.slug} required /><Field name="title" label="Título" defaultValue={property?.title} required wide /><Field name="price" label="Valor" type="number" defaultValue={property?.price} required /><Field name="city" label="Cidade" defaultValue={property?.city || "Curitiba"} required /><Field name="neighborhood" label="Bairro" defaultValue={property?.neighborhood} required /><Field name="address" label="Endereço (opcional)" defaultValue={property?.address || ""} /><Field name="bedrooms" label="Quartos" type="number" defaultValue={property?.bedrooms ?? 0} required /><Field name="bathrooms" label="Banheiros" type="number" defaultValue={property?.bathrooms ?? 0} required /><Field name="parkingSpaces" label="Vagas" type="number" defaultValue={property?.parkingSpaces ?? 0} required /><Field name="areaM2" label="Área privativa (m²)" type="number" defaultValue={property?.areaM2} required /></div>
    <label>Descrição<textarea name="description" defaultValue={property?.description} rows={8} minLength={20} required /></label>
    <label>Status<select name="status" defaultValue={property?.status || "inactive"}><option value="inactive">Inativo</option><option value="active">Ativo</option><option value="sold">Vendido</option></select></label>
    <button className="admin-primary" type="submit">Salvar imóvel</button>
  </form>;
}

function Field({ name, label, type = "text", defaultValue, required, wide }: { name: string; label: string; type?: string; defaultValue?: string | number; required?: boolean; wide?: boolean }) {
  return <label className={wide ? "wide" : undefined}>{label}<input name={name} type={type} defaultValue={defaultValue} required={required} /></label>;
}
