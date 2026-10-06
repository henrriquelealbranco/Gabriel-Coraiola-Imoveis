import fs from "fs";
import { createClient } from "@supabase/supabase-js";

async function generate() {
  const client = createClient(
    "https://qawnrsmbxuzsucikcija.supabase.co",
    "sb_publishable_rqdHbmDGxmtdiIWfOrVdPw_BzvM432G"
  );

  const { data: properties, error } = await client
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "active")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching properties:", error);
    process.exit(1);
  }

  const baseUrl = "https://gabrielcoraiolaimoveis.com.br";
  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Home
  xml += `  <url>\n`;
  xml += `    <loc>${baseUrl}/</loc>\n`;
  xml += `    <lastmod>${now}</lastmod>\n`;
  xml += `    <changefreq>daily</changefreq>\n`;
  xml += `    <priority>1.0</priority>\n`;
  xml += `  </url>\n`;

  // Each property
  for (const p of properties) {
    const modDate = p.updated_at ? p.updated_at.split("T")[0] : now;
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/imovel/${p.slug}</loc>\n`;
    xml += `    <lastmod>${modDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  fs.writeFileSync("public/sitemap.xml", xml);
  console.log(`Generated public/sitemap.xml with ${properties.length + 1} URLs.`);

  // Also update public/robots.txt
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /auth

Sitemap: ${baseUrl}/sitemap.xml
`;

  fs.writeFileSync("public/robots.txt", robots);
  console.log("Updated public/robots.txt.");
}

generate().catch(console.error);
