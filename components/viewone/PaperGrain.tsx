// Grano de papel muy sutil sobre toda la página: evita la planitud digital
// perfecta y da una textura física (papel, no pantalla) coherente con una
// empresa que imprime sobre materiales reales. Fixed + pointer-events-none +
// solo transform/opacity en cualquier animación futura — nunca sobre
// contenedores con scroll, para no generar repaint continuo en el GPU.
export function PaperGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
