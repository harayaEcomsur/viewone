// Recolorea cualquier logo (sin importar sus colores originales) a un solo
// tono de marca vía mask-image: usa la silueta/alfa del archivo como
// máscara y la rellena con bg-primary por detrás — así es como la imagen
// de referencia trata TODOS los logos de clientes (los 8 destacados y los
// 20 del carrusel de abajo, ambos en el mismo navy, no uno vívido y el
// otro gris/translúcido como tenía antes el carrusel).
//
// mask-mode: "alpha" explícito: sin él, Chrome resuelve "match-source"
// distinto para el único asset rasterizado del grupo (ver BICE en
// ViewOneHome.tsx) y se ve un recuadro sólido en vez de la silueta.
//
// En hover se revela el color real de la marca (cross-fade con el <img>
// de abajo), como affordance — la referencia es estática y no lo muestra.
export function ClienteLogoMark({
  logo,
  nombre,
  className = "h-7 w-24",
  hidden,
}: {
  logo: string;
  nombre: string;
  className?: string;
  hidden?: boolean;
}) {
  return (
    <span aria-hidden={hidden} className={`group relative block shrink-0 ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-primary transition-opacity duration-200 group-hover:opacity-0"
        style={{
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
          maskMode: "alpha" as const,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
      <img
        src={logo}
        alt={nombre}
        className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
    </span>
  );
}
