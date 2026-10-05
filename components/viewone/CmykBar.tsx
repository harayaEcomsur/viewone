// Barra de calibración CMYK: los 4 colores de separación que usa cualquier
// imprenta digital para calibrar una máquina antes de imprimir — el motivo
// visual más propio del rubro de ViewOne, a diferencia de un acento
// decorativo genérico. Se usa en dosis mínimas (un borde, un separador),
// nunca como fondo grande.
const SWATCHES = ["#00AEEF", "#EC008C", "#FFE800", "#15181D"];

export function CmykBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-[3px] w-full overflow-hidden ${className}`} aria-hidden="true">
      {SWATCHES.map((color) => (
        <span key={color} className="flex-1" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
