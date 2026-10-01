import type { Property, PropertyImage } from "@/lib/properties/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type QueryClient = Pick<SupabaseClient, "from">;
type PropertyRow = Record<string, unknown> & {
  id: string; code: string; slug: string; title: string; description: string;
  price: number | string; city: string; neighborhood: string; address?: string | null;
  bedrooms: number | string; bathrooms: number | string; parking_spaces: number | string;
  area_m2: number | string; status: Property["status"]; property_images?: ImageRow[];
  sun_position?: string | null; condo_fee?: number | string | null; floor_range?: string | null;
};
type ImageRow = Record<string, unknown> & { id: string; storage_path: string; public_url?: string | null; alt_text: string; position: number | string; width?: number | string | null; height?: number | string | null };

function mapImage(image: ImageRow): PropertyImage {
  return {
    id: String(image.id), storagePath: image.storage_path,
    // Sem URL pública não há o que mostrar: o caminho interno do Storage não é um endereço válido.
    url: image.public_url ?? "", altText: image.alt_text,
    position: Number(image.position), width: image.width == null ? null : Number(image.width),
    height: image.height == null ? null : Number(image.height),
  };
}

function mapProperty(row: PropertyRow, { publicOnly }: { publicOnly: boolean }): Property {
  const images = [...(row.property_images ?? [])]
    .map(mapImage)
    .filter((image) => !publicOnly || image.url)
    .sort((a, b) => a.position - b.position);
  return {
    id: String(row.id), code: row.code, slug: row.slug, title: row.title,
    description: row.description, price: Number(row.price), city: row.city,
    neighborhood: row.neighborhood, address: row.address ?? null,
    bedrooms: Number(row.bedrooms), bathrooms: Number(row.bathrooms),
    parkingSpaces: Number(row.parking_spaces), areaM2: Number(row.area_m2),
    status: row.status,
    images,
    sunPosition: row.sun_position ?? null,
    condoFee: row.condo_fee == null ? null : Number(row.condo_fee),
    floorRange: row.floor_range ?? null,
  };
}

async function serverClient(provided?: QueryClient) {
  return provided ?? await (await import("@/lib/supabase/server")).createServerClient();
}

const NO_ROWS = "PGRST116";

export async function getActivePropertyBySlug(slug: string, providedClient?: QueryClient) {
  const client = await serverClient(providedClient);
  const query = () => client.from("properties")
    .select("*, property_images(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .order("position", { foreignTable: "property_images", ascending: true })
    .single();
  let { data, error } = await query();
  // Falha passageira do banco não pode virar "imóvel não encontrado" para quem está vendo o anúncio.
  if (error && error.code !== NO_ROWS) ({ data, error } = await query());
  if (error && error.code !== NO_ROWS) throw new Error(`Falha ao carregar o imóvel: ${error.message}`);
  if (!data) return null;
  return mapProperty(data as PropertyRow, { publicOnly: true });
}

export async function listActiveProperties(client?: QueryClient) {
  try {
    const db = await serverClient(client);
    const { data, error } = await db.from("properties")
      .select("*, property_images(*)")
      .eq("status", "active")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => mapProperty(row as PropertyRow, { publicOnly: true }));
  } catch (error) {
    // A vitrine não pode derrubar a home inteira se o banco oscilar.
    console.error("listActiveProperties", error);
    return [];
  }
}

export async function listAdminProperties(client?: QueryClient) {
  const db = await serverClient(client);
  const { data, error } = await db.from("properties")
    .select("*, property_images(id, storage_path, public_url, alt_text, position)")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapProperty(row as PropertyRow, { publicOnly: false }));
}

export async function listSimilarProperties(
  reference: { id: string; neighborhood: string; city: string },
  limit = 3,
  client?: QueryClient,
) {
  try {
    const db = await serverClient(client);
    // Busca um lote maior e ordena por proximidade em memória: bairro igual primeiro,
    // depois mesma cidade, depois o resto — mais simples que várias consultas encadeadas.
    const { data, error } = await db.from("properties")
      .select("*, property_images(*)")
      .eq("status", "active")
      .neq("id", reference.id)
      .order("updated_at", { ascending: false })
      .limit(24);
    if (error) throw error;
    const proximity = (property: Property) =>
      property.neighborhood === reference.neighborhood ? 0 : property.city === reference.city ? 1 : 2;
    return (data ?? [])
      .map((row) => mapProperty(row as PropertyRow, { publicOnly: true }))
      .sort((a, b) => proximity(a) - proximity(b))
      .slice(0, limit);
  } catch (error) {
    console.error("listSimilarProperties", error);
    return [];
  }
}

export async function getAdminPropertyById(id: string, client?: QueryClient) {
  const db = await serverClient(client);
  const { data, error } = await db.from("properties").select("*, property_images(*)").eq("id", id).order("position", { foreignTable: "property_images", ascending: true }).single();
  if (error || !data) return null;
  return mapProperty(data as PropertyRow, { publicOnly: false });
}
