import type { Property, PropertyImage } from "@/lib/properties/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type QueryClient = Pick<SupabaseClient, "from">;
type PropertyRow = Record<string, unknown> & {
  id: string; code: string; slug: string; title: string; description: string;
  price: number | string; city: string; neighborhood: string; address?: string | null;
  bedrooms: number | string; bathrooms: number | string; parking_spaces: number | string;
  area_m2: number | string; status: Property["status"]; property_images?: ImageRow[];
};
type ImageRow = Record<string, unknown> & { id: string; storage_path: string; public_url?: string | null; alt_text: string; position: number | string; width?: number | string | null; height?: number | string | null };

function mapProperty(row: PropertyRow): Property {
  return {
    id: String(row.id), code: row.code, slug: row.slug, title: row.title,
    description: row.description, price: Number(row.price), city: row.city,
    neighborhood: row.neighborhood, address: row.address ?? null,
    bedrooms: Number(row.bedrooms), bathrooms: Number(row.bathrooms),
    parkingSpaces: Number(row.parking_spaces), areaM2: Number(row.area_m2),
    status: row.status,
    images: (row.property_images ?? []).map((image: ImageRow): PropertyImage => ({
      id: String(image.id), storagePath: image.storage_path,
      url: image.public_url ?? image.storage_path, altText: image.alt_text,
      position: Number(image.position), width: image.width == null ? null : Number(image.width),
      height: image.height == null ? null : Number(image.height),
    })),
  };
}

export async function getActivePropertyBySlug(slug: string, providedClient?: QueryClient) {
  const client = providedClient ?? await (await import("@/lib/supabase/server")).createServerClient();
  const { data, error } = await client.from("properties")
    .select("*, property_images(*)")
    .eq("slug", slug)
    .eq("status", "active")
    .order("position", { foreignTable: "property_images", ascending: true })
    .single();
  if (error || !data) return null;
  return mapProperty(data as PropertyRow);
}

export async function listAdminProperties(client?: QueryClient) {
  const db = client ?? await (await import("@/lib/supabase/server")).createServerClient();
  const { data, error } = await db.from("properties").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => mapProperty({ ...row, property_images: [] } as PropertyRow));
}

export async function getAdminPropertyById(id: string, client?: QueryClient) {
  const db = client ?? await (await import("@/lib/supabase/server")).createServerClient();
  const { data, error } = await db.from("properties").select("*, property_images(*)").eq("id", id).order("position", { foreignTable: "property_images", ascending: true }).single();
  if (error || !data) return null;
  return mapProperty(data as PropertyRow);
}
