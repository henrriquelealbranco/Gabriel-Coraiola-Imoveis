# Real-estate Conversion Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the current public site into a mobile-first property conversion experience backed by a protected internal CMS for property data and ordered image uploads.

**Architecture:** Keep the current Next.js/Vinext application and split the work into domain, data, public UI, and admin boundaries. Supabase provides PostgreSQL, email/password authentication, and Storage; server-only modules perform privileged mutations, while anonymous reads are restricted to active properties. The public property route renders on the server and hydrates only the gallery and WhatsApp CTA.

**Tech Stack:** Next.js 16.2.6, React 19.2.6, TypeScript 5.9.3, Tailwind CSS 4.2.1, Supabase PostgreSQL/Auth/Storage, Zod 3.25.76, Vitest

## Global Constraints

- The first public viewport starts with property photography, not institutional content.
- The first image uses high fetch priority; subsequent images lazy-load.
- Gallery navigation supports touch swipe, horizontal scrolling, keyboard controls, and reduced motion.
- The WhatsApp CTA remains visible throughout the public property journey.
- Public routes expose only `active` properties; `inactive`, `sold`, and missing records return not found.
- Admin writes require an authenticated user present in `admin_users`.
- The Supabase service-role key never reaches client code.
- Initial upload limit is 15 MB per JPEG, PNG, or WebP file.
- No CRM, multi-agency tenancy, payments, proposals, or electronic signatures.

---

### Task 1: Domain model and test harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `lib/properties/types.ts`
- Create: `lib/properties/format.ts`
- Create: `lib/properties/schema.ts`
- Test: `test/properties/format.test.ts`
- Test: `test/properties/schema.test.ts`

**Interfaces:**
- Produces: `PropertyStatus`, `Property`, `PropertyImage`, `PropertyFormInput`, `propertyFormSchema`, `formatCurrency(value)`, and `buildWhatsAppUrl(property, phone)`.

- [ ] **Step 1: Install the test and Supabase dependencies**

Run:

```powershell
npm install @supabase/ssr @supabase/supabase-js
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Configure Vitest with the `jsdom` environment, `@/` alias pointing to the repository root, and `test/setup.ts` importing `@testing-library/jest-dom/vitest`.

- [ ] **Step 2: Write failing formatter tests**

```ts
import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/properties/format";

describe("property formatting", () => {
  it("formats Brazilian currency without cents", () => {
    expect(formatCurrency(760000)).toBe("R$ 760.000");
  });

  it("builds the personalized WhatsApp message", () => {
    const url = buildWhatsAppUrl({ title: "Apartamento no Batel", code: "GC-002" }, "5541999999999");
    expect(decodeURIComponent(url)).toContain("Olá, vi o imóvel Apartamento no Batel/GC-002 e quero agendar uma visita.");
  });
});
```

- [ ] **Step 3: Run the formatter tests and confirm failure**

Run: `npm test -- test/properties/format.test.ts`

Expected: FAIL because `lib/properties/format.ts` does not exist.

- [ ] **Step 4: Implement the types and formatters**

```ts
export type PropertyStatus = "active" | "inactive" | "sold";
export type PropertyImage = { id: string; storagePath: string; altText: string; position: number; width: number | null; height: number | null };
export type Property = { id: string; code: string; slug: string; title: string; description: string; price: number; city: string; neighborhood: string; address: string | null; bedrooms: number; bathrooms: number; parkingSpaces: number; areaM2: number; status: PropertyStatus; images: PropertyImage[] };
```

```ts
export const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);
export function buildWhatsAppUrl(property: Pick<Property, "title" | "code">, phone: string) {
  const text = `Olá, vi o imóvel ${property.title}/${property.code} e quero agendar uma visita.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 5: Write and implement form validation**

```ts
export const propertyFormSchema = z.object({
  code: z.string().trim().min(2).max(30),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(5000),
  price: z.coerce.number().positive(),
  city: z.string().trim().min(2).max(80),
  neighborhood: z.string().trim().min(2).max(80),
  address: z.string().trim().max(180).nullable(),
  bedrooms: z.coerce.number().int().min(0).max(30),
  bathrooms: z.coerce.number().int().min(0).max(30),
  parkingSpaces: z.coerce.number().int().min(0).max(30),
  areaM2: z.coerce.number().positive(),
  status: z.enum(["active", "inactive", "sold"]),
});
```

Test missing titles, invalid slugs, negative prices, and valid coercion in `test/properties/schema.test.ts`, then run `npm test -- test/properties` and require all tests to pass.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json vitest.config.ts lib/properties test/properties
git commit -m "feat: add property domain model"
```

### Task 2: Supabase schema, clients, and access policies

**Files:**
- Create: `.env.example`
- Create: `supabase/migrations/202609100001_properties.sql`
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`
- Create: `lib/properties/repository.ts`
- Test: `test/properties/repository.test.ts`

**Interfaces:**
- Produces: `createBrowserClient()`, `createServerClient()`, `createAdminClient()`, `getActivePropertyBySlug(slug)`, `listAdminProperties()`, and `requireAdmin()`.

- [ ] **Step 1: Define environment keys**

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_PHONE=5541999999999
```

- [ ] **Step 2: Add the database migration**

Create enum `property_status`, tables `properties`, `property_images`, and `admin_users` with the exact columns and foreign keys in the approved spec. Add these indexes:

```sql
create unique index property_images_property_position_idx on property_images(property_id, position);
create index properties_public_lookup_idx on properties(status, slug);
```

Enable RLS and add policies whose predicates are:

```sql
-- anonymous property reads
status = 'active'

-- anonymous image reads
exists (select 1 from properties p where p.id = property_images.property_id and p.status = 'active')

-- authenticated admin writes
exists (select 1 from admin_users a where a.user_id = auth.uid())
```

Create private bucket `property-drafts` and public bucket `property-images`. Permit authenticated admins to write drafts; only server-side publication actions copy validated files into `property-images`.

- [ ] **Step 3: Implement server-only clients**

`lib/supabase/admin.ts` must begin with `import "server-only"` and read `SUPABASE_SERVICE_ROLE_KEY`; `createAdminClient()` must throw when called without the value. Browser code may import only the publishable client.

- [ ] **Step 4: Test repository mapping**

Mock the Supabase query chain and assert that `getActivePropertyBySlug("apartamento-batel")` applies both `.eq("slug", slug)` and `.eq("status", "active")`, orders images by `position`, and maps numeric database fields to numbers.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- test/properties/repository.test.ts`

Expected: PASS.

```powershell
git add .env.example supabase lib/supabase lib/properties/repository.ts test/properties/repository.test.ts
git commit -m "feat: add Supabase property persistence"
```

### Task 3: Mobile-first public property page

**Files:**
- Create: `app/components/property-gallery.tsx`
- Create: `app/components/whatsapp-cta.tsx`
- Modify: `app/imoveis/[id]/page.tsx`
- Create: `app/imovel/[slug]/page.tsx`
- Modify: `app/globals.css`
- Test: `test/properties/public-page.test.tsx`

**Interfaces:**
- Consumes: `Property`, `getActivePropertyBySlug`, `formatCurrency`, and `buildWhatsAppUrl`.
- Produces: `PropertyGallery({ images, title })` and `WhatsAppCta({ property, phone })`.

- [ ] **Step 1: Write the failing public-page test**

Render a fixture property and assert that the first rendered element after navigation is the gallery, the first image has `fetchPriority="high"`, later images have `loading="lazy"`, the price and facts are visible, and the CTA URL contains the property title and code.

- [ ] **Step 2: Implement the gallery**

Use an ordered list with `overflow-x: auto`, `scroll-snap-type: x mandatory`, one full-width slide per image, previous/next buttons, an `aria-live` position indicator, and `scrollTo({ left, behavior })`. Disable smooth behavior when `prefers-reduced-motion: reduce` matches.

The first image must use:

```tsx
<Image src={image.url} alt={image.altText} fill sizes="100vw" priority fetchPriority="high" />
```

Every later image must use `loading="lazy"` and the same responsive `sizes` declaration.

- [ ] **Step 3: Implement the conversion page**

`/imovel/[slug]` loads `getActivePropertyBySlug`, calls `notFound()` for a missing record, renders gallery → essential facts → description, and places `WhatsAppCta` fixed at the mobile bottom edge and sticky in the desktop information column.

- [ ] **Step 4: Preserve old links**

Make `/imoveis/[id]` resolve the active record and permanently redirect to `/imovel/{slug}`. Missing, inactive, and sold records call `notFound()`.

- [ ] **Step 5: Run tests, build, and commit**

Run:

```powershell
npm test -- test/properties/public-page.test.tsx
npm run build
```

Expected: tests and build exit 0.

```powershell
git add app/imovel app/imoveis app/components app/globals.css test/properties/public-page.test.tsx
git commit -m "feat: add mobile property conversion page"
```

### Task 4: Admin authentication and property list

**Files:**
- Create: `app/admin/actions.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/imoveis/page.tsx`
- Create: `app/admin/components/status-select.tsx`
- Test: `test/admin/auth.test.ts`

**Interfaces:**
- Produces: `login(formData)`, `logout()`, `requireAdmin()`, and `updatePropertyStatus(id, status)`.

- [ ] **Step 1: Write failing authorization tests**

Cover unauthenticated redirect to `/admin/login`, authenticated non-admin rejection, and accepted `admin_users` membership.

- [ ] **Step 2: Implement authentication actions**

Validate e-mail and password with Zod, call `supabase.auth.signInWithPassword`, return a generic Portuguese error for invalid credentials, and redirect successful logins to `/admin/imoveis`. Never disclose whether an e-mail exists.

- [ ] **Step 3: Implement the guarded admin layout and list**

Run `requireAdmin()` in the server layout. Render code, title, location, price, status, edit link, and an accessible status control for each record. The status action must re-check admin authorization and validate `z.enum(["active", "inactive", "sold"])`.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- test/admin/auth.test.ts`

Expected: PASS.

```powershell
git add app/admin lib/supabase test/admin/auth.test.ts
git commit -m "feat: protect the property admin"
```

### Task 5: Property form and mutations

**Files:**
- Create: `app/admin/imoveis/actions.ts`
- Create: `app/admin/imoveis/novo/page.tsx`
- Create: `app/admin/imoveis/[id]/page.tsx`
- Create: `app/admin/components/property-form.tsx`
- Test: `test/admin/property-actions.test.ts`

**Interfaces:**
- Produces: `createProperty(formData)`, `updateProperty(id, formData)`, and `deleteProperty(id)`.

- [ ] **Step 1: Write failing mutation tests**

Assert validation errors preserve field names, duplicate `code`/`slug` errors become user-readable messages, successful creation returns the new ID, and every action calls `requireAdmin()` before mutation.

- [ ] **Step 2: Implement the shared form**

Use React Hook Form with `zodResolver(propertyFormSchema)`. Include all approved fields, display inline errors, disable submission while pending, and show success/error feedback with the installed `sonner` component.

- [ ] **Step 3: Implement server actions**

Parse `FormData` through `propertyFormSchema`, map camelCase fields to database columns, set `updated_at`, revalidate `/`, `/imovel/[slug]`, and `/admin/imoveis`, and redirect creation to `/admin/imoveis/{id}`.

- [ ] **Step 4: Run tests and commit**

Run: `npm test -- test/admin/property-actions.test.ts`

Expected: PASS.

```powershell
git add app/admin test/admin/property-actions.test.ts
git commit -m "feat: add property create and edit flows"
```

### Task 6: Image upload, ordering, and publication

**Files:**
- Create: `app/admin/components/image-manager.tsx`
- Create: `app/admin/imoveis/[id]/images/actions.ts`
- Create: `lib/properties/images.ts`
- Test: `test/admin/image-actions.test.ts`

**Interfaces:**
- Produces: `validateImage(file)`, `uploadDraftImages(propertyId, files)`, `reorderImages(propertyId, imageIds)`, `deleteImage(propertyId, imageId)`, and `publishPropertyImages(propertyId)`.

- [ ] **Step 1: Write failing image tests**

Test rejection above 15 MB, rejection of non-JPEG/PNG/WebP MIME types, deterministic draft paths, duplicate/missing IDs during reorder, and sequential positions beginning at zero.

- [ ] **Step 2: Implement upload validation**

```ts
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 15 * 1024 * 1024;
export function validateImage(file: File) {
  if (!allowedTypes.has(file.type)) throw new Error("Formato de imagem não permitido.");
  if (file.size > maxBytes) throw new Error("A imagem deve ter no máximo 15 MB.");
}
```

Store drafts at `{propertyId}/{crypto.randomUUID()}-{sanitizedName}`. Record width, height, alt text, and position after each successful upload. Return per-file failures without discarding completed uploads.

- [ ] **Step 3: Implement accessible ordering**

Render thumbnail rows with “Mover para cima”, “Mover para baixo”, and “Excluir” buttons. Persist the complete ordered ID array in one server action and update positions in a transaction/RPC to avoid unique-index collisions.

- [ ] **Step 4: Implement publication rules**

Activation must require at least one image. Copy ordered drafts into `property-images`, update database paths only after all copies succeed, and remove copied files during rollback. Deactivation or sale removes public copies after the database status change succeeds.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- test/admin/image-actions.test.ts`

Expected: PASS.

```powershell
git add app/admin/components/image-manager.tsx app/admin/imoveis/[id]/images lib/properties/images.ts test/admin/image-actions.test.ts
git commit -m "feat: add ordered property image management"
```

### Task 7: Final integration, performance, and operating guide

**Files:**
- Create: `docs/admin-guide.md`
- Modify: `README.md`
- Modify: `next.config.ts`
- Test: `test/integration/property-lifecycle.test.ts`

**Interfaces:**
- Consumes all preceding public and admin interfaces.
- Produces a documented, deployable property lifecycle from draft creation to public conversion page.

- [ ] **Step 1: Add the property lifecycle integration test**

Create inactive property → upload two images → reorder → activate → assert public slug is returned → mark sold → assert public lookup returns null. Mock Supabase boundaries only; exercise real domain and action code.

- [ ] **Step 2: Configure image hosts and caching**

Allow only the exact Supabase project hostname in `images.remotePatterns`. Set one-year immutable caching for published storage objects and no-store responses for admin routes.

- [ ] **Step 3: Document operation**

`docs/admin-guide.md` must explain login, property creation, supported images, ordering, status meanings, publication conditions, WhatsApp phone configuration, and recovery from individual upload errors. `README.md` must list every environment key and migration command without containing credentials.

- [ ] **Step 4: Run the full verification suite**

Run:

```powershell
npm test
npm run lint
npm run build
```

Expected: every command exits 0 with no failing test or TypeScript/build error.

- [ ] **Step 5: Verify key routes with an authenticated test environment**

Check `/imovel/{active-slug}`, `/admin/login`, `/admin/imoveis`, creation, image ordering, activation, sold-state removal, mobile gallery navigation, and sticky WhatsApp CTA. Confirm an anonymous request cannot mutate data.

- [ ] **Step 6: Commit**

```powershell
git add README.md docs/admin-guide.md next.config.ts test/integration
git commit -m "docs: complete property platform operating guide"
```

## Execution order and external requirements

Execute Tasks 1–3 first to deliver the public conversion page. Execute Tasks 4–6 as the CMS phase, then Task 7 as the release gate. Live integration requires a Supabase project URL, publishable key, service-role key stored only in the deployment secret manager, and one authenticated user added to `admin_users`.
