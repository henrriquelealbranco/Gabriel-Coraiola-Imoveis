const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 15 * 1024 * 1024;

export function validateImage(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error("Formato de imagem não permitido.");
  if (file.size > maxBytes) throw new Error("A imagem deve ter no máximo 15 MB.");
}

export function buildDraftPath(propertyId: string, filename: string, uuid = crypto.randomUUID()) {
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  const basename = filename.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "imagem";
  return `${propertyId}/${uuid}-${basename}.${extension}`;
}

export function normalizeImageOrder(ids: string[]) {
  if (new Set(ids).size !== ids.length) throw new Error("A ordem contém IDs duplicados.");
  return ids.map((id, position) => ({ id, position }));
}
