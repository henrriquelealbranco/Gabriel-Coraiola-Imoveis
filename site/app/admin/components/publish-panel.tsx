"use client";

import { useActionState } from "react";
import { updatePropertyStatus } from "@/app/admin/imoveis/actions";
import type { PropertyStatus } from "@/lib/properties/types";

type Props = { id: string; slug: string; status: PropertyStatus; imageCount: number };

const copy: Record<PropertyStatus, { title: string; detail: (imageCount: number) => string }> = {
  active: { title: "No ar", detail: () => "Visitantes já encontram este imóvel no site." },
  inactive: {
    title: "Fora do site",
    detail: (n) => (n ? "Pronto para publicar. Só aparece no site depois que você publicar." : "Envie ao menos uma foto para poder publicar."),
  },
  sold: { title: "Vendido", detail: () => "Fora do site. Republique se o negócio não se concretizar." },
};

export function PublishPanel({ id, slug, status, imageCount }: Props) {
  const [state, formAction, pending] = useActionState(updatePropertyStatus, null);
  const text = copy[status];

  return (
    <section className={`publish-panel is-${status}`} aria-label="Publicação">
      <div className="publish-panel__state">
        <span className={`status-dot status-${status}`} aria-hidden="true" />
        <div>
          <strong>{text.title}</strong>
          <span>{text.detail(imageCount)}</span>
        </div>
      </div>
      {/* Um formulário por ação: o cliente de server actions do vinext não envia o botão clicado. */}
      <div className="publish-panel__actions">
        {status === "active" ? (
          <>
            <a className="admin-ghost" href={`/imovel/${slug}`} target="_blank" rel="noreferrer">Ver no site</a>
            <StatusButton action={formAction} id={id} status="sold" className="admin-ghost" disabled={pending}>Marcar como vendido</StatusButton>
            <StatusButton action={formAction} id={id} status="inactive" className="admin-ghost" disabled={pending}>Tirar do site</StatusButton>
          </>
        ) : (
          <StatusButton action={formAction} id={id} status="active" className="admin-primary" disabled={pending || imageCount === 0}>
            {pending ? "Publicando…" : status === "sold" ? "Republicar no site" : "Publicar no site"}
          </StatusButton>
        )}
      </div>
      {state?.message && <p className="form-error publish-panel__error" role="alert">{state.message}</p>}
    </section>
  );
}

type StatusButtonProps = {
  action: (formData: FormData) => void; id: string; status: PropertyStatus;
  className: string; disabled: boolean; children: React.ReactNode;
};

function StatusButton({ action, id, status, className, disabled, children }: StatusButtonProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={className} type="submit" disabled={disabled}>{children}</button>
    </form>
  );
}
