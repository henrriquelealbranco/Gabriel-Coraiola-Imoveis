"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { propertyFormSchema } from "@/lib/properties/schema";
import { parsePropertyForm } from "@/lib/properties/form";

function toRow(data: z.infer<typeof propertyFormSchema>) {
  return { code: data.code, slug: data.slug, title: data.title, description: data.description, price: data.price, city: data.city, neighborhood: data.neighborhood, address: data.address, bedrooms: data.bedrooms, bathrooms: data.bathrooms, parking_spaces: data.parkingSpaces, area_m2: data.areaM2, status: data.status, updated_at: new Date().toISOString() };
}

async function context() {
  const { requireAdmin } = await import("@/lib/supabase/auth");
  const { createServerClient } = await import("@/lib/supabase/server");
  await requireAdmin();
  return createServerClient();
}

export async function createProperty(formData: FormData): Promise<void> {
  const parsed = parsePropertyForm(formData);
  if (!parsed.ok) throw new Error("Revise os campos destacados e tente novamente.");
  const supabase = await context();
  const { data, error } = await supabase.from("properties").insert(toRow(parsed.data)).select("id").single();
  if (error) throw new Error(error.code === "23505" ? "Código ou endereço do imóvel já está em uso." : "Não foi possível salvar o imóvel.");
  revalidatePath("/admin/imoveis");
  redirect(`/admin/imoveis/${data.id}`);
}

export async function updateProperty(id: string, formData: FormData): Promise<void> {
  const parsed = parsePropertyForm(formData);
  if (!parsed.ok) throw new Error("Revise os campos destacados e tente novamente.");
  const supabase = await context();
  const { error } = await supabase.from("properties").update(toRow(parsed.data)).eq("id", id);
  if (error) throw new Error(error.code === "23505" ? "Código ou endereço do imóvel já está em uso." : "Não foi possível salvar o imóvel.");
  revalidatePath("/admin/imoveis"); revalidatePath(`/imovel/${parsed.data.slug}`);
}

export async function updatePropertyStatus(formData: FormData) {
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z.enum(["active", "inactive", "sold"]).parse(formData.get("status"));
  const supabase = await context();
  if (status === "active") {
    const { count } = await supabase.from("property_images").select("id", { count: "exact", head: true }).eq("property_id", id);
    if (!count) throw new Error("Adicione ao menos uma foto antes de ativar o imóvel.");
  }
  const { error } = await supabase.from("properties").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/imoveis");
}

export async function deleteProperty(id: string) {
  const supabase = await context();
  const { error } = await supabase.from("properties").delete().eq("id", z.string().uuid().parse(id));
  if (error) throw error;
  revalidatePath("/admin/imoveis");
  redirect("/admin/imoveis");
}
