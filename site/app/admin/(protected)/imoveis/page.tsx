import Link from "next/link";
import { StatusSelect } from "@/app/admin/components/status-select";
import { formatCurrency } from "@/lib/properties/format";
import { listAdminProperties } from "@/lib/properties/repository";

export default async function AdminPropertiesPage() {
  const properties = await listAdminProperties();
  return <main className="admin-shell"><div className="admin-title"><div><p className="eyebrow">Portfólio</p><h1>Imóveis cadastrados</h1></div><Link className="admin-primary" href="/admin/imoveis/novo">Novo imóvel</Link></div><div className="admin-table-wrap"><table><thead><tr><th>Código</th><th>Imóvel</th><th>Valor</th><th>Status</th><th></th></tr></thead><tbody>{properties.map((property) => <tr key={property.id}><td>{property.code}</td><td><strong>{property.title}</strong><span>{property.neighborhood}, {property.city}</span></td><td>{formatCurrency(property.price)}</td><td><StatusSelect id={property.id} status={property.status} /></td><td><Link href={`/admin/imoveis/${property.id}`}>Editar</Link></td></tr>)}</tbody></table></div></main>;
}
