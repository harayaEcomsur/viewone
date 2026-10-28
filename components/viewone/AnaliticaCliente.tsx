"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { AvisoCookies } from "@/components/viewone/AvisoCookies";
import { MedicionClics } from "@/components/viewone/MedicionClics";

// Rutas internas que no se miden (pedido 2026-10-27): el panel lo usa el
// equipo de ViewOne para administrar el contenido, y sus visitas inflaban los
// números del sitio. Ahí no se carga GA4, no sale el aviso de cookies, no se
// miden clics y Vercel Analytics descarta la visita.
const RUTAS_INTERNAS = ["/viewone-admin"];

function esInterna(ruta: string) {
  return RUTAS_INTERNAS.some((r) => ruta === r || ruta.startsWith(`${r}/`));
}

export function AnaliticaCliente({ ga4Id }: { ga4Id: string | null }) {
  const interna = esInterna(usePathname() ?? "");

  // Si GA4 ya estaba cargado (se aceptaron cookies en el sitio) y se navega
  // al panel sin recargar, este flag oficial de gtag corta el envío.
  useEffect(() => {
    if (!ga4Id) return;
    (window as unknown as Record<string, boolean>)[`ga-disable-${ga4Id}`] = interna;
  }, [ga4Id, interna]);

  return (
    <>
      <Analytics
        beforeSend={(evento) => {
          try {
            return esInterna(new URL(evento.url).pathname) ? null : evento;
          } catch {
            return evento;
          }
        }}
      />
      {!interna && (
        <>
          <AvisoCookies ga4Id={ga4Id} />
          <MedicionClics />
        </>
      )}
    </>
  );
}
