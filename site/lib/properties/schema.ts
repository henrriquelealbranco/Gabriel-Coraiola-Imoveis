import { z } from "zod";

const nullableText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(180).nullable(),
);

export const propertyFormSchema = z.object({
  code: z.string().trim().min(2).max(30),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use somente letras minúsculas, números e hífens."),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(5000),
  price: z.coerce.number().positive(),
  city: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().min(2).max(80),
  address: nullableText,
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().int().min(0).max(30),
  parkingSpaces: z.coerce.number().int().min(0).max(30),
  areaM2: z.coerce.number().positive(),
  status: z.enum(["active", "inactive", "sold"]),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
