"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buildDraftPath, normalizeImageOrder, validateImage } from "@/lib/properties/images";

async function context() {
  const { requireAdmin } = await import("@/lib/supabase/auth");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  await requireAdmin(); return createAdminClient();
}

export async function uploadDraftImages(formData: FormData): Promise<void> {
  const propertyId = z.string().uuid().parse(formData.get("propertyId"));
  const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
  const supabase = await context(); const failures: string[] = [];
  const { count } = await supabase.from("property_images").select("id", { count: "exact", head: true }).eq("property_id", propertyId);
  let position = count || 0;
  for (const file of files) {
    try {
      validateImage(file); const path = buildDraftPath(propertyId, file.name);
      const { error: uploadError } = await supabase.storage.from("property-drafts").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error: rowError } = await supabase.from("property_images").insert({ property_id: propertyId, storage_path: path, alt_text: file.name.replace(/\.[^.]+$/, ""), position: position++ });
      if (rowError) { await supabase.storage.from("property-drafts").remove([path]); throw rowError; }
    } catch (error) { failures.push(`${file.name}: ${error instanceof Error ? error.message : "falha no envio"}`); }
  }
  revalidatePath(`/admin/imoveis/${propertyId}`);
  if (failures.length) throw new Error(failures.join("\n"));
}

export async function reorderImages(propertyId: string, imageIds: string[]) {
  z.string().uuid().parse(propertyId); const order = normalizeImageOrder(imageIds); const supabase = await context();
  const { data } = await supabase.from("property_images").select("id").eq("property_id", propertyId);
  const existing = new Set((data || []).map(({ id }) => id));
  if (order.length !== existing.size || order.some(({ id }) => !existing.has(id))) throw new Error("A ordem precisa incluir todas as fotos do imóvel.");
  await Promise.all(order.map(({ id, position }) => supabase.from("property_images").update({ position: position + 10000 }).eq("id", id).eq("property_id", propertyId)));
  await Promise.all(order.map(({ id, position }) => supabase.from("property_images").update({ position }).eq("id", id).eq("property_id", propertyId)));
  revalidatePath(`/admin/imoveis/${propertyId}`);
}

export async function moveImage(formData: FormData) {
  const propertyId = String(formData.get("propertyId")); const imageId = String(formData.get("imageId")); const direction = Number(formData.get("direction"));
  const ids = formData.getAll("imageIds").map(String); const index = ids.indexOf(imageId); const target = index + direction;
  if (index < 0 || target < 0 || target >= ids.length) return;
  [ids[index], ids[target]] = [ids[target], ids[index]]; await reorderImages(propertyId, ids);
}

export async function deleteImage(formData: FormData) {
  const propertyId = z.string().uuid().parse(formData.get("propertyId")); const imageId = z.string().uuid().parse(formData.get("imageId")); const supabase = await context();
  const { data } = await supabase.from("property_images").select("storage_path, public_url").eq("id", imageId).eq("property_id", propertyId).single();
  if (!data) return; await supabase.from("property_images").delete().eq("id", imageId);
  await supabase.storage.from(data.public_url ? "property-images" : "property-drafts").remove([data.storage_path]); revalidatePath(`/admin/imoveis/${propertyId}`);
}

export async function publishPropertyImages(propertyId: string) {
  const supabase = await context(); const { data: images } = await supabase.from("property_images").select("*").eq("property_id", propertyId).order("position");
  if (!images?.length) throw new Error("Adicione ao menos uma foto antes de publicar.");
  const copied: string[] = [];
  try {
    for (const image of images) { const target = `${propertyId}/${image.id}-${image.storage_path.split("/").pop()}`; const { error } = await supabase.storage.from("property-drafts").copy(image.storage_path, target, { destinationBucket: "property-images" } as never); if (error) throw error; copied.push(target); const { data } = supabase.storage.from("property-images").getPublicUrl(target); await supabase.from("property_images").update({ storage_path: target, public_url: data.publicUrl }).eq("id", image.id); }
  } catch (error) { if (copied.length) await supabase.storage.from("property-images").remove(copied); throw error; }
}
