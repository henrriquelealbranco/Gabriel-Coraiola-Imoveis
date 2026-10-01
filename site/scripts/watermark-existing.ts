// Aplica a marca d'água às fotos já publicadas antes dela existir.
// Uso: npx tsx scripts/watermark-existing.ts --preview <pasta>   (gera amostras locais, não altera nada)
//      npx tsx scripts/watermark-existing.ts --apply             (regrava as fotos no Storage)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { hasWatermark, WATERMARK_SUFFIX, watermarkSvg } from "@/lib/properties/watermark";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").split(/\r?\n/).filter((line) => line.includes("=")).map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }),
);
const base = env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, "");
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };
const BUCKET = "property-images";

type Row = { id: string; storage_path: string; public_url: string | null };

export async function applyWatermark(input: Buffer) {
  const { data, info } = await sharp(input).rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
  return sharp(data)
    .composite([{ input: Buffer.from(watermarkSvg(info.width, info.height)) }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
}

const encodePath = (path: string) => path.split("/").map(encodeURIComponent).join("/");

async function main() {
  const mode = process.argv[2];
  if (mode !== "--preview" && mode !== "--apply") throw new Error("Use --preview <pasta> ou --apply");
  const response = await fetch(`${base}/rest/v1/property_images?select=id,storage_path,public_url&order=property_id,position`, { headers });
  const rows = (await response.json()) as Row[];
  const pending = rows.filter((row) => row.public_url && !hasWatermark(row.storage_path));
  console.log(`${rows.length} fotos, ${pending.length} sem marca d'água`);

  if (mode === "--preview") {
    const dir = process.argv[3];
    mkdirSync(dir, { recursive: true });
    for (const [index, row] of pending.slice(0, 3).entries()) {
      const original = Buffer.from(await (await fetch(row.public_url!)).arrayBuffer());
      writeFileSync(join(dir, `amostra-${index + 1}.jpg`), await applyWatermark(original));
    }
    console.log(`amostras em ${dir}`);
    return;
  }

  let done = 0;
  for (const row of pending) {
    const original = Buffer.from(await (await fetch(row.public_url!)).arrayBuffer());
    const output = await applyWatermark(original);
    // Arquivo novo em vez de sobrescrever: a URL antiga pode estar em cache no CDN e nos navegadores.
    const target = row.storage_path.replace(/\.[^.\/]+$/, "") + `${WATERMARK_SUFFIX}.jpg`;
    const upload = await fetch(`${base}/storage/v1/object/${BUCKET}/${encodePath(target)}`, {
      method: "POST", headers: { ...headers, "Content-Type": "image/jpeg", "x-upsert": "true" }, body: new Uint8Array(output),
    });
    if (!upload.ok) { console.error("falha no upload", row.id, await upload.text()); continue; }
    const publicUrl = `${base}/storage/v1/object/public/${BUCKET}/${encodePath(target)}`;
    const update = await fetch(`${base}/rest/v1/property_images?id=eq.${row.id}`, {
      method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ storage_path: target, public_url: publicUrl }),
    });
    if (!update.ok) { console.error("falha ao atualizar", row.id, await update.text()); continue; }
    // O original sem marca fica guardado no bucket privado, fora do site.
    const backup = await fetch(`${base}/storage/v1/object/copy`, {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ bucketId: BUCKET, sourceKey: row.storage_path, destinationBucket: "property-drafts", destinationKey: `originais/${row.storage_path}` }),
    });
    if (backup.ok) {
      await fetch(`${base}/storage/v1/object/${BUCKET}`, {
        method: "DELETE", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: [row.storage_path] }),
      });
    } else {
      console.error("original mantido no bucket público (cópia falhou)", row.storage_path, await backup.text());
    }
    done++;
    console.log(`${done}/${pending.length} ${target.split("/").pop()} (${(original.length / 1024).toFixed(0)} KB -> ${(output.length / 1024).toFixed(0)} KB)`);
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
