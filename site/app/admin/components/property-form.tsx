"use client";

import { useActionState, useState } from "react";
import type { Property } from "@/lib/properties/types";
import type { PropertyFormState } from "@/app/admin/imoveis/actions";
import { slugify } from "@/lib/properties/slug";

type Action = (prevState: PropertyFormState, formData: FormData) => Promise<PropertyFormState>;

export function PropertyForm({ property, action }: { property?: Property; action: Action }) {
  const [state, formAction, pending] = useActionState(action, null);
  const [title, setTitle] = useState(property?.title ?? "");
  const [slug, setSlug] = useState(property?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(property?.slug));
  const errors = state?.fieldErrors ?? {};
  const isNew = !property;

  function onTitle(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  return (
    <form action={formAction} className="property-form">
      <fieldset className="form-section">
        <legend>Identificação</legend>
        <div className="form-grid">
          <Field name="code" label="Código" hint="Seu código interno, ex.: GC-012." defaultValue={property?.code} error={errors.code} required />
          <Field name="title" label="Título do anúncio" value={title} onChange={onTitle} error={errors.title} required />
          <Field
            name="slug"
            label="Endereço da página"
            hint={slug ? `…/imovel/${slug}` : "Gerado automaticamente a partir do título."}
            value={slug}
            onChange={(value) => { setSlugEdited(true); setSlug(value); }}
            error={errors.slug}
            wide
          />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Valor e localização</legend>
        <div className="form-grid">
          <Field name="price" label="Valor de venda (R$)" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={property?.price} error={errors.price} required />
          <Field name="neighborhood" label="Bairro" defaultValue={property?.neighborhood} error={errors.neighborhood} required />
          <Field name="city" label="Cidade" defaultValue={property?.city || "Curitiba"} error={errors.city} required />
          <Field name="address" label="Endereço" hint="Opcional. Não aparece no site." defaultValue={property?.address || ""} error={errors.address} />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Características</legend>
        <div className="form-grid form-grid--4">
          <Field name="bedrooms" label="Quartos" type="number" min="0" inputMode="numeric" defaultValue={property?.bedrooms ?? 0} error={errors.bedrooms} required />
          <Field name="bathrooms" label="Banheiros" type="number" min="0" inputMode="numeric" defaultValue={property?.bathrooms ?? 0} error={errors.bathrooms} required />
          <Field name="parkingSpaces" label="Vagas" type="number" min="0" inputMode="numeric" defaultValue={property?.parkingSpaces ?? 0} error={errors.parkingSpaces} required />
          <Field name="areaM2" label="Área privativa (m²)" type="number" step="0.01" min="0" inputMode="decimal" defaultValue={property?.areaM2} error={errors.areaM2} required />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Destaques adicionais</legend>
        <div className="form-grid">
          <Field name="sunPosition" label="Posição solar" hint="Opcional. Ex.: Nascente." defaultValue={property?.sunPosition || ""} error={errors.sunPosition} />
          <Field name="condoFee" label="Taxa de condomínio (R$)" type="number" step="0.01" min="0" inputMode="decimal" hint="Opcional." defaultValue={property?.condoFee ?? ""} error={errors.condoFee} />
          <Field name="floorRange" label="Faixa de andares" hint='Opcional. Ex.: "do 4º ao 6º andar".' defaultValue={property?.floorRange || ""} error={errors.floorRange} wide />
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Descrição</legend>
        <label>
          <span className="sr-only">Descrição</span>
          <textarea name="description" defaultValue={property?.description} rows={8} minLength={20} required aria-invalid={errors.description ? true : undefined} placeholder="Conte o que torna este imóvel especial: luz, planta, acabamentos, entorno." />
          {errors.description && <span className="field-error">{errors.description[0]}</span>}
        </label>
      </fieldset>

      <div className="form-actions">
        {state?.message && <p className={state.ok ? "form-success" : "form-error"} role={state.ok ? "status" : "alert"}>{state.message}</p>}
        <button className="admin-primary" type="submit" disabled={pending}>
          {pending ? "Salvando…" : isNew ? "Cadastrar e adicionar fotos" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  name: string; label: string; type?: string; hint?: string;
  step?: string; min?: string; inputMode?: "numeric" | "decimal";
  defaultValue?: string | number; value?: string; onChange?: (value: string) => void;
  error?: string[]; required?: boolean; wide?: boolean;
};

function Field({ name, label, type = "text", hint, step, min, inputMode, defaultValue, value, onChange, error, required, wide }: FieldProps) {
  const controlled = value !== undefined;
  return (
    <label className={wide ? "wide" : undefined}>
      {label}
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        inputMode={inputMode}
        required={required}
        aria-invalid={error ? true : undefined}
        {...(controlled ? { value, onChange: (event) => onChange?.(event.target.value) } : { defaultValue })}
      />
      {error ? <span className="field-error">{error[0]}</span> : hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}
