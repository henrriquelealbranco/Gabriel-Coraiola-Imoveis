# Gabriel Coraiola Public Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the public Gabriel Coraiola real-estate site faithfully, including its homepage filters and three public property-detail routes.

**Architecture:** Use the bundled Vinext Sites starter and keep property records in a typed local module. The homepage is a client component that filters those records; detail routes read the same module and render a shared public layout. No database, login, uploads, or administration are included.

**Tech Stack:** Vinext, React, TypeScript, CSS, Cloudflare Sites hosting

## Global Constraints

- Preserve the published Portuguese copy, content hierarchy, sober palette, editorial typography, and three current listings.
- Keep the temporary WhatsApp number `5541999999999` until the user supplies a real number.
- Main body text must be at least 16px; routine labels at least 14px.
- Support mobile and desktop without unintended horizontal scrolling.
- Do not add an administrative area in this phase.

---

### Task 1: Project foundation and property model

**Files:**
- Create via starter: `package.json`, `vite.config.ts`, `app/layout.tsx`, `app/globals.css`
- Create: `app/data/properties.ts`
- Create: `public/images/apartamento-batel.png`
- Create: `public/images/casa-condominio.png`
- Create: `public/images/sobrado-agua-verde.png`

**Interfaces:**
- Produces: `Property` type, `properties: Property[]`, `formatPrice(value: number): string`, and `whatsappUrl(propertyTitle?: string): string`.

- [ ] **Step 1: Scaffold the project**

Run the Sites `project-setup.mjs` script in the checkout and preserve the generated lockfile and hosting integration.

- [ ] **Step 2: Add the typed property model**

Define the exact public fields below:

```ts
export type Property = {
  id: "1" | "2" | "3";
  type: "Casa" | "Apartamento" | "Sobrado";
  title: string;
  neighborhood: string;
  city: "Curitiba";
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  image: string;
  imageAlt: string;
  summary: string;
};
```

Populate IDs 1–3 with the values visible on the reference site: R$ 998.000, R$ 760.000, and R$ 625.000, respectively.

- [ ] **Step 3: Add formatting and contact helpers**

```ts
export const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

export const whatsappUrl = (propertyTitle?: string) => {
  const message = propertyTitle
    ? `Olá, Gabriel! Gostaria de saber mais sobre o imóvel: ${propertyTitle}.`
    : "Olá, Gabriel! Gostaria de encontrar um imóvel.";
  return `https://wa.me/5541999999999?text=${encodeURIComponent(message)}`;
};
```

- [ ] **Step 4: Apply the faithful global theme**

Use dark charcoal, warm white, muted gold, thin uppercase labels, generous whitespace, serif display headings, restrained corners, visible focus styles, and smooth anchor scrolling.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts app public .openai
git commit -m "feat: establish public property site foundation"
```

### Task 2: Homepage and filters

**Files:**
- Create: `app/components/property-catalog.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `properties`, `formatPrice`, and `whatsappUrl` from `app/data/properties.ts`.
- Produces: `PropertyCatalog(): JSX.Element` with type, maximum-price, and minimum-bedroom filters.

- [ ] **Step 1: Implement filter predicates**

Filter by exact type unless `Todos`, by `property.price <= maximumPrice`, and by `property.bedrooms >= minimumBedrooms`.

- [ ] **Step 2: Build the catalog component**

Render three labeled native selects, the live result count, responsive listing cards, semantic links to `/imoveis/{id}`, and an empty state with a reset button.

- [ ] **Step 3: Recreate the homepage sections**

Render the sticky header, hero copy, two primary links, trust strip, catalog introduction, catalog component, Gabriel biography, contact callout, footer, and floating WhatsApp link using the exact reference-site copy from the approved design.

- [ ] **Step 4: Verify the production build**

Run: `node C:/Users/Lenovo/.codex/plugins/cache/openai-bundled/sites/0.1.66/scripts/build-site.mjs`

Expected: exit code 0 with the homepage and client catalog compiled.

- [ ] **Step 5: Commit**

```bash
git add app
git commit -m "feat: recreate homepage and property filters"
```

### Task 3: Public property details, validation, and hosting

**Files:**
- Create: `app/imoveis/[id]/page.tsx`
- Create: `app/not-found.tsx`
- Modify: `app/globals.css`
- Modify: `.openai/hosting.json`

**Interfaces:**
- Consumes: property records and helpers from `app/data/properties.ts`.
- Produces: public detail pages for IDs 1, 2, and 3 plus a clear not-found state.

- [ ] **Step 1: Implement the detail route**

Find the route record by ID. Render the full-width property photograph, breadcrumb links, type/status, title, location, price, four facts, approved summary, Gabriel contact card, and final visit call-to-action.

- [ ] **Step 2: Implement the missing-property state**

Use the framework not-found behavior and provide a link back to `/#imoveis`.

- [ ] **Step 3: Validate local assets and build**

Run: `node C:/Users/Lenovo/.codex/plugins/cache/openai-bundled/sites/0.1.66/scripts/build-site.mjs`

Expected: exit code 0; no unresolved local image references; Worker entrypoint and client assets emitted.

- [ ] **Step 4: Save and deploy the Site**

Register one Site, persist its ID in `.openai/hosting.json`, save a version, deploy it, and verify the terminal deployment status.

- [ ] **Step 5: Commit**

```bash
git add app .openai public
git commit -m "feat: add public property detail pages"
```
