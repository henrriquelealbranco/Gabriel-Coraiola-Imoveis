export const dynamic = "force-dynamic";

import Link from "next/link";
import { ImageOff, Plus } from "lucide-react";
import { StatusSelect } from "@/app/admin/components/status-select";
import { formatCurrency } from "@/lib/properties/format";
import { listAdminProperties } from "@/lib/properties/repository";

export default async function AdminPropertiesPage() {
  const properties = await listAdminProperties();
  const live = properties.filter((property) => property.status === "active").length;

  return (
    <main className="admin-shell">
      <div className="admin-title">
        <div>
          <p className="eyebrow">Portfólio</p>
          <h1>Imóveis</h1>
          <p className="admin-summary">
            {properties.length
              ? `${properties.length} ${properties.length === 1 ? "cadastrado" : "cadastrados"} · ${live} no site`
              : "Nenhum imóvel cadastrado ainda."}
          </p>
        </div>
        <Link className="admin-primary" href="/admin/imoveis/novo"><Plus /> Novo imóvel</Link>
      </div>

      {properties.length === 0 ? (
        <div className="admin-empty">
          <h2>Cadastre o primeiro imóvel</h2>
          <p>Preencha os dados, envie as fotos e publique. Leva poucos minutos.</p>
          <Link className="admin-primary" href="/admin/imoveis/novo"><Plus /> Novo imóvel</Link>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr><th>Imóvel</th><th>Valor</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr>
            </thead>
            <tbody>
              {properties.map((property) => {
                const cover = property.images.find((image) => image.url);
                return (
                  <tr key={property.id}>
                    <td>
                      <Link className="admin-property" href={`/admin/imoveis/${property.id}`}>
                        {cover ? <img src={cover.url} alt="" loading="lazy" /> : <span className="admin-thumb-empty" title="Sem fotos"><ImageOff /></span>}
                        <span>
                          <strong>{property.title}</strong>
                          <small>{property.code} · {property.neighborhood}, {property.city} · {property.images.length} {property.images.length === 1 ? "foto" : "fotos"}</small>
                        </span>
                      </Link>
                    </td>
                    <td className="admin-price">{formatCurrency(property.price)}</td>
                    <td><StatusSelect id={property.id} status={property.status} /></td>
                    <td><Link className="admin-ghost" href={`/admin/imoveis/${property.id}`}>Editar</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
