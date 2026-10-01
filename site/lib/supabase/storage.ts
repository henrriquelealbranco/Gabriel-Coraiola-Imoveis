import "server-only";

// O cliente de Storage do supabase-js decodifica a chave como JWT e rejeita o
// formato novo (sb_secret_…) com "Invalid Compact JWS". A API REST aceita, então
// falamos com ela diretamente.

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Credenciais administrativas do Supabase não configuradas.");
  return { url: url.replace(/\/+$/, ""), key };
}

function authHeaders(key: string, extra?: Record<string, string>) {
  return { apikey: key, Authorization: `Bearer ${key}`, ...extra };
}

function encodePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

async function toError(response: Response, fallback: string) {
  const body = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(body) as { message?: string; error?: string };
    return new Error(parsed.message || parsed.error || fallback);
  } catch {
    return new Error(body || fallback);
  }
}

export async function uploadObject(bucket: string, path: string, file: File) {
  const { url, key } = config();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${encodePath(path)}`, {
    method: "POST",
    headers: authHeaders(key, { "Content-Type": file.type || "application/octet-stream" }),
    body: file,
  });
  if (!response.ok) throw await toError(response, "Falha ao enviar a imagem.");
}

export async function copyObject(bucket: string, sourceKey: string, destinationBucket: string, destinationKey: string) {
  const { url, key } = config();
  const response = await fetch(`${url}/storage/v1/object/copy`, {
    method: "POST",
    headers: authHeaders(key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ bucketId: bucket, sourceKey, destinationBucket, destinationKey }),
  });
  if (!response.ok) throw await toError(response, "Falha ao publicar a imagem.");
}

export async function removeObjects(bucket: string, paths: string[]) {
  if (!paths.length) return;
  const { url, key } = config();
  await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: authHeaders(key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: paths }),
  });
}

export function publicUrl(bucket: string, path: string) {
  const { url } = config();
  return `${url}/storage/v1/object/public/${bucket}/${encodePath(path)}`;
}
