"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { propertyFormSchema } from "@/lib/properties/schema";
import { parsePropertyForm } from "@/lib/properties/form";

export type PropertyFormState = { message?: string; fieldErrors?: Record<string, string[] | undefined>; ok?: boolean } | null;
export type StatusState = { message?: string } | null;

// O status fica fora do formulário de edição: ele é controlado só pelos botões de publicação,
// para que salvar o formulário nunca desfaça uma publicação feita em outra tela.
function toRow(data: z.infer<typeof propertyFormSchema>): Record<string, unknown> {
  return { code: data.code, slug: data.slug, title: data.title, description: data.description, price: data.price, city: data.city, neighborhood: data.neighborhood, address: data.address, bedrooms: data.bedrooms, bathrooms: data.bathrooms, parking_spaces: data.parkingSpaces, area_m2: data.areaM2, sun_position: data.sunPosition, condo_fee: data.condoFee, floor_range: data.floorRange, updated_at: new Date().toISOString() };
}

// PGRST204 (PostgREST) ou 42703 (Postgres puro) = coluna inexistente: acontece se a migração de
// sun_position/condo_fee/floor_range ainda não rodou em produção. Tenta de novo sem esses três
// campos em vez de travar o cadastro inteiro.
const EXTRA_COLUMNS = ["sun_position", "condo_fee", "floor_range"] as const;
const isMissingColumn = (error: { code?: string } | null) => error?.code === "PGRST204" || error?.code === "42703";
function withoutExtraColumns(row: Record<string, unknown>) {
  const copy = { ...row };
  for (const column of EXTRA_COLUMNS) delete copy[column];
  return copy;
}

async function context() {
  const { requireAdmin } = await import("@/lib/supabase/auth");
  const { createServerClient } = await import("@/lib/supabase/server");
  await requireAdmin();
  return createServerClient();
}

function saveFailure(error: { code?: string }): PropertyFormState {
  return { message: error.code === "23505" ? "Já existe um imóvel com esse código ou esse título. Use um código diferente ou ajuste o título." : "Não foi possível salvar o imóvel. Tente novamente." };
}

function isRedirect(error: unknown) {
  return error instanceof Error && "digest" in error;
}

export async function createProperty(_prevState: PropertyFormState, formData: FormData): Promise<PropertyFormState> {
  try {
    const parsed = parsePropertyForm(formData);
    if (!parsed.ok) return { message: "Revise os campos destacados.", fieldErrors: parsed.fieldErrors };
    const supabase = await context();
    // Recém-criado ainda não tem fotos, então nasce fora do site.
    const row = { ...toRow(parsed.data), status: "inactive" };
    let { data, error } = await supabase.from("properties").insert(row).select("id").single();
    if (error && isMissingColumn(error)) ({ data, error } = await supabase.from("properties").insert(withoutExtraColumns(row)).select("id").single());
    if (error || !data) return saveFailure(error ?? {});
    revalidatePath("/admin/imoveis");
    redirect(`/admin/imoveis/${data.id}?novo=1`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return { message: "Ocorreu um erro inesperado. Tente novamente." };
  }
  return null;
}

export async function updateProperty(id: string, _prevState: PropertyFormState, formData: FormData): Promise<PropertyFormState> {
  try {
    const parsed = parsePropertyForm(formData);
    if (!parsed.ok) return { message: "Revise os campos destacados.", fieldErrors: parsed.fieldErrors };
    const supabase = await context();
    const row = toRow(parsed.data);
    let { error } = await supabase.from("properties").update(row).eq("id", id);
    if (error && isMissingColumn(error)) ({ error } = await supabase.from("properties").update(withoutExtraColumns(row)).eq("id", id));
    if (error) return saveFailure(error);
    revalidatePath("/admin/imoveis");
    revalidatePath("/");
    revalidatePath(`/imovel/${parsed.data.slug}`);
  } catch (e) {
    if (isRedirect(e)) throw e;
    return { message: "Ocorreu um erro inesperado. Tente novamente." };
  }
  return { ok: true, message: "Alterações salvas." };
}

const statusInput = z.object({ id: z.string().uuid(), status: z.enum(["active", "inactive", "sold"]) });

export async function updatePropertyStatus(_prevState: StatusState, formData: FormData): Promise<StatusState> {
  const parsed = statusInput.safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return { message: "Não foi possível identificar a alteração. Recarregue a página e tente de novo." };
  const { id, status } = parsed.data;
  try {
    const supabase = await context();
    if (status === "active") {
      const { count } = await supabase.from("property_images").select("id", { count: "exact", head: true }).eq("property_id", id);
      if (!count) return { message: "Envie ao menos uma foto antes de publicar." };
      const { publishPropertyImages } = await import("@/app/admin/imoveis/[id]/images/actions");
      await publishPropertyImages(id);
    }
    const { error } = await supabase.from("properties").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return { message: "Não foi possível alterar o status. Tente novamente." };
    revalidatePath("/admin/imoveis");
    revalidatePath(`/admin/imoveis/${id}`);
    revalidatePath("/");
  } catch (e) {
    if (isRedirect(e)) throw e;
    console.error("updatePropertyStatus", e);
    return { message: status === "active" ? "Não foi possível publicar as fotos. Tente novamente em instantes." : "Não foi possível alterar o status. Tente novamente." };
  }
  return null;
}

export async function deleteProperty(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const supabase = await context();
  // Os arquivos saem antes da linha: o cascade apaga os registros das fotos, mas não os arquivos no Storage.
  const { removePropertyFiles } = await import("@/app/admin/imoveis/[id]/images/actions");
  await removePropertyFiles(id);
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error("Não foi possível excluir o imóvel.");
  revalidatePath("/admin/imoveis");
  revalidatePath("/");
  redirect("/admin/imoveis");
}
