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
};

export default nextConfig;
