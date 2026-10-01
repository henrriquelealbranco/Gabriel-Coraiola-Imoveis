"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { buildDraftPath, normalizeImageOrder, validateImage } from "@/lib/properties/images";
import { copyObject, publicUrl, removeObjects, uploadObject } from "@/lib/supabase/storage";

const DRAFTS = "property-drafts";
const PUBLISHED = "property-images";

async function context() {
  const { requireAdmin } = await import("@/lib/supabase/auth");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  await requireAdmin(); return createAdminClient();
}

async function refresh(propertyId: string) {
  revalidatePath(`/admin/imoveis/${propertyId}`);
  revalidatePath("/");
}

export type ImageUploadState = { message?: string; uploaded?: number } | null;

export async function uploadDraftImages(_prevState: ImageUploadState, formData: FormData): Promise<ImageUploadState> {
  try {
    const propertyId = z.string().uuid().parse(formData.get("propertyId"));
    const files = formData.getAll("images").filter((value): value is File => value instanceof File && value.size > 0);
    if (!files.length) return { message: "Selecione ao menos uma foto." };
    const supabase = await context();
    // Posição a partir da maior existente: contar as linhas colide com o índice único depois de uma exclusão.
    const { data: last } = await supabase.from("property_images").select("position").eq("property_id", propertyId).order("position", { ascending: false }).limit(1).maybeSingle();
    let position = last ? Number(last.position) + 1 : 0;
    const failures: string[] = [];
    let uploaded = 0;
    for (const file of files) {
      try {
        validateImage(file);
        // Vai direto para o bucket público: a visibilidade do imóvel é controlada pelo status, não pelo arquivo.
        const path = buildDraftPath(propertyId, file.name);
        await uploadObject(PUBLISHED, path, file);
        const { error: rowError } = await supabase.from("property_images").insert({ property_id: propertyId, storage_path: path, public_url: publicUrl(PUBLISHED, path), alt_text: "", position: position++ });
        if (rowError) { await removeObjects(PUBLISHED, [path]); throw new Error(rowError.message); }
        uploaded++;
      } catch (error) { failures.push(`${file.name}: ${error instanceof Error ? error.message : "falha no envio"}`); }
    }
    await refresh(propertyId);
    if (failures.length) return { message: failures.join(" · "), uploaded };
    return { uploaded };
  } catch (error) {
    return { message: error instanceof Error ? error.message : "Não foi possível enviar as fotos." };
  }
}

export async function reorderImages(propertyId: string, imageIds: string[]) {
  z.string().uuid().parse(propertyId); const order = normalizeImageOrder(imageIds); const supabase = await context();
  const { data } = await supabase.from("property_images").select("id").eq("property_id", propertyId);
  const existing = new Set((data || []).map(({ id }) => id));
  if (order.length !== existing.size || order.some(({ id }) => !existing.has(id))) throw new Error("A ordem precisa incluir todas as fotos do imóvel.");
  await Promise.all(order.map(({ id, position }) => supabase.from("property_images").update({ position: position + 10000 }).eq("id", id).eq("property_id", propertyId)));
  await Promise.all(order.map(({ id, position }) => supabase.from("property_images").update({ position }).eq("id", id).eq("property_id", propertyId)));
  await refresh(propertyId);
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
  if (!data) return;
  await supabase.from("property_images").delete().eq("id", imageId);
  await removeObjects(data.public_url ? PUBLISHED : DRAFTS, [data.storage_path]);
  await refresh(propertyId);
}

// Fotos antigas ainda no bucket de rascunho são copiadas para o público ao publicar o imóvel.
export async function publishPropertyImages(propertyId: string) {
  const supabase = await context(); const { data: images } = await supabase.from("property_images").select("*").eq("property_id", propertyId).order("position");
  if (!images?.length) throw new Error("Adicione ao menos uma foto antes de publicar.");
  const pending = images.filter((image) => !image.public_url);
  const copied: string[] = [];
  try {
    for (const image of pending) {
      const target = `${propertyId}/${image.id}-${image.storage_path.split("/").pop()}`;
      await copyObject(DRAFTS, image.storage_path, PUBLISHED, target);
      copied.push(target);
      await supabase.from("property_images").update({ storage_path: target, public_url: publicUrl(PUBLISHED, target) }).eq("id", image.id);
    }
  } catch (error) { await removeObjects(PUBLISHED, copied); throw error; }
}

export async function removePropertyFiles(propertyId: string) {
  const supabase = await context();
  const { data } = await supabase.from("property_images").select("storage_path, public_url").eq("property_id", propertyId);
  const rows = data ?? [];
  await removeObjects(PUBLISHED, rows.filter((row) => row.public_url).map((row) => row.storage_path));
  await removeObjects(DRAFTS, rows.filter((row) => !row.public_url).map((row) => row.storage_path));
}
