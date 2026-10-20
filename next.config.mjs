/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // La optimización de imágenes la hacemos nosotros (resize + recompresión
    // de los assets reales en public/clients/viewone/ antes de subirlos),
    // no el servicio de Image Optimization de Vercel — unoptimized:true
    // evita que cada <Image> dispare esa función serverless (uso facturable
    // aparte en el plan de Vercel) y sirve directo el archivo ya optimizado.
    unoptimized: true,
  },
  // Logos de clientes subidos desde el panel (Vercel Blob, otro dominio):
  // la fila de logos los recolorea con CSS mask-image, y una máscara de otro
  // origen exige CORS — servirlos por el mismo dominio (/media/…, proxy de
  // Vercel) evita depender de eso. Ver lib/viewone-media.ts.
  async rewrites() {
    return [
      {
        source: "/media/:store([a-z0-9]+)/:path*",
        destination: "https://:store.public.blob.vercel-storage.com/:path*",
      },
    ];
  },
};

export default nextConfig;
