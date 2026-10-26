"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

// Consentimiento de cookies (2026-10-26, Ley 21.719): GA4 deja cookies que no
// son necesarias para que el sitio funcione, así que NO se carga hasta que la
// persona acepta. Rechazar es igual de fácil que aceptar (mismo tamaño, mismo
// lugar). La elección vive en localStorage del navegador: es una preferencia
// de esa persona, no un dato que el negocio necesite guardar.
//
// Vercel Web Analytics no pasa por acá: no usa cookies ni identifica a nadie.
const CLAVE = "viewone-cookies";
const EVENTO_REABRIR = "viewone:preferencias-cookies";
type Eleccion = "aceptadas" | "rechazadas";

function leerEleccion(): Eleccion | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === "aceptadas" || v === "rechazadas" ? v : null;
  } catch {
    return null;
  }
}

function guardarEleccion(v: Eleccion) {
  try {
    localStorage.setItem(CLAVE, v);
  } catch {
    // modo privado o almacenamiento bloqueado: vale solo para esta visita
  }
}

// Al retirar el consentimiento, borra las cookies _ga* que ya haya dejado GA4.
function borrarCookiesGA() {
  const dominio = location.hostname.replace(/^www\./, "");
  for (const par of document.cookie.split(";")) {
    const nombre = par.split("=")[0].trim();
    if (!nombre.startsWith("_ga")) continue;
    for (const d of ["", `; domain=${dominio}`, `; domain=.${dominio}`]) {
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  }
}

export function AvisoCookies({ ga4Id }: { ga4Id: string | null }) {
  const [eleccion, setEleccion] = useState<Eleccion | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const actual = leerEleccion();
    setEleccion(actual);
    setVisible(actual === null);
    const reabrir = () => setVisible(true);
    window.addEventListener(EVENTO_REABRIR, reabrir);
    return () => window.removeEventListener(EVENTO_REABRIR, reabrir);
  }, []);

  function elegir(v: Eleccion) {
    guardarEleccion(v);
    setVisible(false);
    if (v === "rechazadas" && eleccion === "aceptadas") {
      // gtag ya está cargado en esta página: recargar es la forma segura de
      // cortarlo del todo.
      borrarCookiesGA();
      location.reload();
      return;
    }
    setEleccion(v);
  }

  return (
    <>
      {ga4Id && eleccion === "aceptadas" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ga4Id}');`}
          </Script>
        </>
      )}

      {visible && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-md sm:p-0"
        >
          <div className="rounded-2xl border border-foreground/10 bg-background p-5 shadow-2xl shadow-primary/20">
            <p className="font-heading text-base font-bold text-primary">Usamos cookies para medir visitas</p>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">
              Con Google Analytics sabemos, de forma agregada, qué páginas se ven y desde dónde llegan. No lo usamos para
              publicidad. El sitio funciona igual si rechazas.{" "}
              <a href="/privacidad" className="font-semibold text-accent underline-offset-2 hover:underline">
                Más información
              </a>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => elegir("rechazadas")}
                className="rounded-lg border border-accent/40 px-4 py-2.5 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => elegir("aceptadas")}
                className="rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/20 transition-colors hover:bg-accent/90"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Para cambiar la elección después (footer y /privacidad).
export function BotonPreferenciasCookies({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO_REABRIR))} className={className}>
      Preferencias de cookies
    </button>
  );
}
