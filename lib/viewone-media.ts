// URL de Vercel Blob → misma ruta servida por este dominio (/media/<store>/…,
// rewrite en next.config.mjs). Necesario para CSS mask-image (exige CORS si
// la imagen es de otro origen); cualquier otra URL se devuelve tal cual.
export function mismoOrigen(url: string): string {
  const m = /^https:\/\/([a-z0-9]+)\.public\.blob\.vercel-storage\.com\/(.+)$/.exec(url);
  return m ? `/media/${m[1]}/${m[2]}` : url;
}
