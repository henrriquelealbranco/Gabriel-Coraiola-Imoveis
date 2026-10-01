"use client";

import { useActionState } from "react";
import { updatePropertyStatus } from "@/app/admin/imoveis/actions";
import type { PropertyStatus } from "@/lib/properties/types";

const labels: Record<PropertyStatus, string> = { active: "No site", inactive: "Fora do site", sold: "Vendido" };

export function StatusSelect({ id, status }: { id: string; status: PropertyStatus }) {
  const [state, formAction, pending] = useActionState(updatePropertyStatus, null);
  return (
    <form action={formAction} className="status-form">
      <span className={`status-pill status-${status}`}>{labels[status]}</span>
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} aria-label="Alterar status" key={status}>
        <option value="active">Publicar</option>
        <option value="inactive">Tirar do site</option>
        <option value="sold">Vendido</option>
      </select>
      <button type="submit" disabled={pending}>{pending ? "…" : "Aplicar"}</button>
      {state?.message && <span className="status-error" role="alert">{state.message}</span>}
    </form>
  );
}
