import { propertyFormSchema } from "@/lib/properties/schema";
import { slugify } from "@/lib/properties/slug";

export function parsePropertyForm(formData: FormData) {
  const raw = Object.fromEntries(formData) as Record<string, unknown>;
  const typed = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");
  raw.slug = slugify(typed("slug").trim() || typed("title"));
  const result = propertyFormSchema.safeParse(raw);
  if (!result.success) return { ok: false as const, fieldErrors: result.error.flatten().fieldErrors };
  return { ok: true as const, data: result.data };
}
