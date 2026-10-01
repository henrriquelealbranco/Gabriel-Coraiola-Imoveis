"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { uploadDraftImages } from "@/app/admin/imoveis/[id]/images/actions";
import { WATERMARK_SUFFIX, watermarkSvg } from "@/lib/properties/watermark";

const MAX_EDGE = 2400;
const QUALITY = 0.85;

async function loadWatermark(width: number, height: number) {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(watermarkSvg(width, height))}`;
  await image.decode();
  return image;
}

// Reduz fotos de celular (3–8 MB) e grava a marca d'água no próprio arquivo, para que ela
// acompanhe a foto mesmo quando alguém a baixa ou compartilha.
async function prepare(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) { bitmap.close(); return file; }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    let suffix = "";
    try {
      context.drawImage(await loadWatermark(canvas.width, canvas.height), 0, 0, canvas.width, canvas.height);
      suffix = WATERMARK_SUFFIX;
    } catch {
      // Sem o sufixo, o script scripts/watermark-existing.ts aplica a marca depois.
    }
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob) return file;
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}${suffix}.jpg`, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function ImageUploadForm({ propertyId }: { propertyId: string }) {
  const [state, formAction, pending] = useActionState(uploadDraftImages, null);
  const [preparing, setPreparing] = useState(false);
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const busy = preparing || pending;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const files = Array.from(input.current?.files ?? []);
    if (!files.length) return;
    setPreparing(true);
    const optimized = await Promise.all(files.map(prepare));
    setPreparing(false);
    const data = new FormData();
    data.set("propertyId", propertyId);
    optimized.forEach((file) => data.append("images", file));
    startTransition(() => formAction(data));
    form.reset();
    setSelected(0);
  }

  return (
    <form onSubmit={onSubmit} className="image-upload">
      <label className="image-drop">
        <input
          ref={input}
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          onChange={(event) => setSelected(event.currentTarget.files?.length ?? 0)}
        />
        <strong>{selected ? `${selected} ${selected === 1 ? "foto selecionada" : "fotos selecionadas"}` : "Escolher fotos"}</strong>
        <span>JPEG, PNG ou WebP. Pode selecionar várias de uma vez.</span>
      </label>
      <button type="submit" disabled={busy || selected === 0}>
        {preparing ? "Preparando…" : pending ? "Enviando…" : "Enviar fotos"}
      </button>
      {state?.message && <p className="form-error upload-feedback" role="alert">{state.message}</p>}
      {!state?.message && state?.uploaded ? (
        <p className="form-success upload-feedback" role="status">{state.uploaded === 1 ? "1 foto enviada." : `${state.uploaded} fotos enviadas.`}</p>
      ) : null}
    </form>
  );
}
