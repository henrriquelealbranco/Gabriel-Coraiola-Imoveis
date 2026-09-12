import { updatePropertyStatus } from "@/app/admin/imoveis/actions";
import type { PropertyStatus } from "@/lib/properties/types";

export function StatusSelect({ id, status }: { id: string; status: PropertyStatus }) {
  return <form action={updatePropertyStatus}><input type="hidden" name="id" value={id} /><select name="status" defaultValue={status} aria-label="Status do imóvel"><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="sold">Vendido</option></select><button type="submit">Salvar</button></form>;
}
