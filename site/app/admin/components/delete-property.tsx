"use client";

import { useFormStatus } from "react-dom";
import { deleteProperty } from "@/app/admin/imoveis/actions";

export function DeleteProperty({ id, title }: { id: string; title: string }) {
  return (
    <section className="danger-zone" aria-label="Excluir imóvel">
      <div>
        <strong>Excluir imóvel</strong>
        <span>Remove o cadastro e todas as fotos. Não dá para desfazer.</span>
      </div>
      <form
        action={deleteProperty}
        onSubmit={(event) => { if (!window.confirm(`Excluir "${title}" e todas as fotos? Não dá para desfazer.`)) event.preventDefault(); }}
      >
        <input type="hidden" name="id" value={id} />
        <SubmitButton />
      </form>
    </section>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="admin-danger" type="submit" disabled={pending}>{pending ? "Excluindo…" : "Excluir imóvel"}</button>;
}
