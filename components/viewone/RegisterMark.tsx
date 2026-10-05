// Mira de registro (register mark): la cruz dentro de un círculo que usan las
// imprentas para alinear las planchas de color en una máquina offset. Es el
// símbolo más reconocible del oficio de ViewOne — se usa como firma visual
// puntual (esquinas de fotos destacadas, separadores de sección) en vez de
// un ícono genérico de librería, que no tendría ningún significado para este
// rubro específico.
export function RegisterMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.25" />
      <path d="M12 1v6M12 17v6M1 12h6M17 12h6" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}
