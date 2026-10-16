// Carrusel lento de los 20 clientes (feedback real, "Dirección visual": "20
// logos en carrusel lento. Referencia de comportamiento: milamark.cl"). CSS
// puro (transform + animation, sin librería nueva): la lista se duplica una
// vez para que el loop sea perfecto, y se pausa en hover. La animación vive
// en app/globals.css (.clientes-marquee__track) para poder apagarla por
// completo bajo prefers-reduced-motion sin tocar este componente — con
// motion reducido, la fila queda estática y se envuelve (flex-wrap) en vez
// de desbordar sin forma de leerla completa.
export function ClientesMarquee({ clientes }: { clientes: string[] }) {
  return (
    <div className="clientes-marquee overflow-hidden">
      <div className="clientes-marquee__track flex w-max items-center gap-10 sm:gap-14">
        {[...clientes, ...clientes].map((nombre, i) => (
          <span
            key={`${nombre}-${i}`}
            aria-hidden={i >= clientes.length}
            className="shrink-0 font-heading text-base font-extrabold uppercase tracking-wide text-foreground/35 sm:text-lg"
          >
            {nombre}
          </span>
        ))}
      </div>
    </div>
  );
}
