"use client";

import { useEffect } from "react";
import { registrarEvento } from "@/lib/analitica";

// Un solo listener para todos los clics que importan a un B2B que vende por
// cotización: WhatsApp, teléfono, correo, redes y cualquier link a /contacto.
// Ver el catálogo en lib/analitica.ts.

// Dónde estaba el link: header, footer, o el título de la sección del Home
// en la que está (el contenido es editable, así que se lee del DOM).
function ubicacionDe(el: Element): string {
  if (el.closest("header")) return "header";
  if (el.closest("footer")) return "footer";
  if (el.closest("[role=dialog]")) return "dialogo";
  const seccion = el.closest("section");
  const titulo = seccion?.querySelector("h1, h2")?.textContent?.trim();
  if (titulo) return titulo.slice(0, 60);
  if (seccion?.id) return seccion.id;
  // Botón flotante de WhatsApp y similares: fuera de cualquier sección.
  return getComputedStyle(el).position === "fixed" ? "flotante" : "pagina";
}

const REDES: [RegExp, string][] = [
  [/instagram\.com/i, "instagram"],
  [/facebook\.com|fb\.com/i, "facebook"],
  [/linkedin\.com/i, "linkedin"],
];

function textoDe(a: HTMLAnchorElement): string {
  return (a.textContent?.trim() || a.getAttribute("aria-label") || "").slice(0, 60);
}

export function MedicionClics() {
  useEffect(() => {
    function alClic(e: MouseEvent) {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const ubicacion = ubicacionDe(a);

      if (/wa\.me|whatsapp\.com|^whatsapp:/i.test(href)) {
        registrarEvento("whatsapp_click", { ubicacion, texto: textoDe(a) });
      } else if (href.startsWith("tel:")) {
        registrarEvento("phone_click", { ubicacion });
      } else if (href.startsWith("mailto:")) {
        registrarEvento("email_click", { ubicacion });
      } else {
        const red = REDES.find(([re]) => re.test(href))?.[1];
        if (red) {
          registrarEvento("social_click", { red, ubicacion });
        } else if (a.pathname === "/contacto" && a.origin === location.origin) {
          registrarEvento("cta_click", { texto: textoDe(a), ubicacion });
        }
      }
    }
    // Captura: se registra antes de que la navegación saque a la persona.
    document.addEventListener("click", alClic, true);
    return () => document.removeEventListener("click", alClic, true);
  }, []);

  return null;
}
