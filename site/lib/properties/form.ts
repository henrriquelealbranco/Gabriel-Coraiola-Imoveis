import { propertyFormSchema } from "@/lib/properties/schema";

export function parsePropertyForm(formData: FormData) {
  const result = propertyFormSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { ok: false as const, fieldErrors: result.error.flatten().fieldErrors };
  return { ok: true as const, data: result.data };
}
