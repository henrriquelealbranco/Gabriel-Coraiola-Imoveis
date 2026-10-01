import { MARK_PATH, MARK_VIEWBOX } from "@/app/components/brand-mark-path";

// Sufixo no nome do arquivo: marca fotos que já receberam a marca d'água, para nunca aplicar duas vezes.
export const WATERMARK_SUFFIX = "-wm";
export const hasWatermark = (path: string) => /-wm\.[a-z0-9]+$/i.test(path);

const [, , MARK_W, MARK_H] = MARK_VIEWBOX.split(" ").map(Number);

// Uma única definição, usada no navegador (fotos novas) e no script de migração (fotos antigas).
export function watermarkSvg(width: number, height: number) {
  const markH = Math.round(Math.min(width, height) * 0.24);
  const markW = Math.round((markH * MARK_W) / MARK_H);
  const scale = markH / MARK_H;
  const x = Math.round((width - markW) / 2);
  const y = Math.round((height - markH) / 2);
  // Halo escuro desfocado por trás do dourado: separa a marca de paredes claras e de cenas cheias de detalhe.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    + `<defs><linearGradient id="g" x1="0" y1="0" x2=".35" y2="1">`
    + `<stop offset="0%" stop-color="#f3e6b4"/><stop offset="36%" stop-color="#dcc189"/>`
    + `<stop offset="68%" stop-color="#bd9b57"/><stop offset="100%" stop-color="#8d6e37"/>`
    + `</linearGradient>`
    + `<filter id="h" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>`
    + `<g opacity="0.62" transform="translate(${x} ${y}) scale(${scale.toFixed(5)})">`
    + `<path fill-rule="evenodd" fill="#000" fill-opacity="0.55" stroke="#000" stroke-opacity="0.55" stroke-width="3" filter="url(#h)" d="${MARK_PATH}"/>`
    + `<path fill-rule="evenodd" fill="url(#g)" d="${MARK_PATH}"/>`
    + `</g></svg>`;
}
