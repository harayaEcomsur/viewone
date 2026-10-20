// Logo de cliente antes de subirlo: la fila de logos del Home los recolorea
// con mask-image (usa la silueta/alfa), así que un PNG/JPG con fondo blanco
// o gris opaco se vería como un recuadro sólido (pasó con BICE, Aconcagua y
// Salfa — ver CLAUDE.md). Mismo arreglo que se hacía a mano con PIL: si la
// imagen no trae transparencia, el alfa sale de cuánto se aleja cada pixel
// del color del fondo (muestreado en las esquinas), conservando su color
// original para el hover. Además recorta márgenes vacíos y achica a 600px.
export async function procesarLogo(file: File): Promise<File> {
  const src = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen."));
      el.src = src;
    });
    const w0 = img.naturalWidth || 600;
    const h0 = img.naturalHeight || 200;
    const escala = Math.min(1, 600 / w0, 300 / h0);
    const w = Math.max(1, Math.round(w0 * escala));
    const h = Math.max(1, Math.round(h0 * escala));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Tu navegador no permite procesar imágenes.");
    ctx.drawImage(img, 0, 0, w, h);
    const datos = ctx.getImageData(0, 0, w, h);
    const px = datos.data;

    let transparentes = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] < 250) transparentes++;
    if (transparentes / (w * h) < 0.02) {
      const esquinas = [0, w - 1, (h - 1) * w, h * w - 1].map((p) => p * 4);
      const fondo = [0, 1, 2].map((c) => esquinas.reduce((acc, p) => acc + px[p + c], 0) / 4);
      const dist = new Float32Array(w * h);
      let max = 1;
      for (let p = 0; p < w * h; p++) {
        const i = p * 4;
        const d = Math.hypot(px[i] - fondo[0], px[i + 1] - fondo[1], px[i + 2] - fondo[2]) / Math.sqrt(3);
        dist[p] = d;
        if (d > max) max = d;
      }
      for (let p = 0; p < w * h; p++) px[p * 4 + 3] = Math.min(255, Math.round((dist[p] / max) * 255 * 1.15));
    }

    // Recorte de márgenes vacíos (para que el logo llene su caja en el Home).
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++)
        if (px[(y * w + x) * 4 + 3] > 12) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    if (x1 < 0) throw new Error("La imagen parece vacía.");
    ctx.putImageData(datos, 0, 0);
    const cw = x1 - x0 + 1;
    const ch = y1 - y0 + 1;
    const out = document.createElement("canvas");
    out.width = cw;
    out.height = ch;
    out.getContext("2d")!.drawImage(canvas, x0, y0, cw, ch, 0, 0, cw, ch);
    const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("No se pudo procesar la imagen.");
    return new File([blob], "logo.png", { type: "image/png" });
  } finally {
    URL.revokeObjectURL(src);
  }
}
