import { z } from "zod";

// Vazio ou ausente vira null: campos opcionais, e o HTML sempre manda a chave mesmo sem preencher,
// mas objetos montados à mão (chamadas internas, testes) podem simplesmente omitir a chave.
const isBlank = (value: unknown) => value === undefined || (typeof value === "string" && value.trim() === "");

const nullableText = z.preprocess(
  (value) => (isBlank(value) ? null : value),
  z.string().trim().max(180).nullable(),
);

const nullableCurrency = z.preprocess(
  (value) => (isBlank(value) ? null : value),
  z.coerce.number({ message: "Informe um valor em números." }).min(0, "Informe um valor válido.").nullable(),
);

export const propertyFormSchema = z.object({
  code: z.string().trim().min(2, "Informe o código do imóvel.").max(30),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Informe um título válido para gerar o endereço da página."),
  title: z.string().trim().min(5, "O título precisa ter ao menos 5 caracteres.").max(120),
  description: z.string().trim().min(20, "A descrição precisa ter ao menos 20 caracteres.").max(5000),
  price: z.coerce.number({ message: "Informe o valor em números." }).positive("Informe o valor em números."),
  city: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().min(2, "Informe o bairro.").max(80),
  address: nullableText,
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().int().min(0).max(30),
  parkingSpaces: z.coerce.number().int().min(0).max(30),
  areaM2: z.coerce.number({ message: "Informe a área em números." }).positive("Informe a área em números."),
  sunPosition: nullableText,
  condoFee: nullableCurrency,
  floorRange: nullableText,
  status: z.enum(["active", "inactive", "sold"]).optional(),
});

export type PropertyFormInput = z.infer<typeof propertyFormSchema>;
