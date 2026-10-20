"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Cliente } from "@/lib/viewone-clientes";
import { mismoOrigen } from "@/lib/viewone-media";
import { ClienteLogoMark } from "@/components/viewone/ClienteLogoMark";

// Pase de fidelidad a la referencia (17-oct-2026, reemplaza el carrusel
// automático anterior): la imagen muestra 2 filas ESTÁTICAS de 10 logos
// cada una (20 en total, el mismo universo de clientes que ya teníamos) con
// flechas prev/next a la derecha del eyebrow — no una fila que se desplaza
// sola. Las flechas solo tienen sentido si hay más clientes de los que
// caben en esas 2 filas; con exactamente 20 (10×2) no se muestran. Si el
// admin agrega más clientes en el futuro, PAGE_SIZE pagina de a 20 y las
// flechas aparecen solas.
const PAGE_SIZE = 20;

export function ClientesMarquee({
  clientes,
  eyebrow = "Experiencia con empresas de distintos rubros",
}: {
  clientes: Cliente[];
  eyebrow?: string;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(clientes.length / PAGE_SIZE);
  const paginado = totalPages > 1;
  const visibles = paginado ? clientes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : clientes;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">{eyebrow}</p>
        {paginado && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
              aria-label="Página anterior de clientes"
              className="rounded-full border border-foreground/15 p-1.5 text-foreground/60 transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => (p + 1) % totalPages)}
              aria-label="Página siguiente de clientes"
              className="rounded-full border border-foreground/15 p-1.5 text-foreground/60 transition-colors hover:border-accent hover:text-accent"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="mt-5 grid grid-cols-3 items-center gap-x-6 gap-y-6 sm:grid-cols-5 sm:gap-x-8 lg:grid-cols-10">
        {visibles.map(({ id, nombre, logo }) => {
          return logo ? (
            <ClienteLogoMark key={id} logo={mismoOrigen(logo)} nombre={nombre} className="h-6 w-full sm:h-7" />
          ) : (
            <span
              key={id}
              className="shrink-0 text-center font-heading text-sm font-extrabold uppercase tracking-wide text-foreground/35 sm:text-base"
            >
              {nombre}
            </span>
          );
        })}
      </div>
    </div>
  );
}
