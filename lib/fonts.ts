import { Inter, Poppins, Lora, Work_Sans, Quicksand, Nunito, Playfair_Display, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";

const interFont = Inter({ subsets: ["latin"], variable: "--font-body" });
const poppinsFont = Poppins({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-heading" });

const loraFont = Lora({ subsets: ["latin"], variable: "--font-heading" });
const workSansFont = Work_Sans({ subsets: ["latin"], variable: "--font-body" });

const quicksandFont = Quicksand({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-heading" });
const nunitoFont = Nunito({ subsets: ["latin"], variable: "--font-body" });

// Playfair Display + Inter: par recomendado por ui-ux-pro-max (--design-system
// "beauty salon hair services elegant") para belleza/spa/lujo — serif editorial
// de más carácter que Lora, para rubros que piden "elegante CON estilo", no solo
// prolijo (ver README → "Diseño distintivo por cliente").
const playfairFont = Playfair_Display({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-heading" });

// Pase de diseño 2026-10-04 (histórico): Archivo + IBM Plex Sans, elegido
// para evitar Inter (el font-tell más común de sitios hechos con IA).
//
// Pase de diseño 2026-10-16 (reemplaza al anterior): el cliente mandó una
// imagen de referencia real y pidió explícitamente "ojalá misma tipografía"
// — con eso como dato concreto, pesa más que la heurística genérica
// anti-Inter de antes. La referencia usa una geométrica redondeada con "g"
// de un solo piso (visible en "gráficas", "digital"), muy distinta a la
// Archivo/Plex Sans de doble piso que había. Plus Jakarta Sans es el
// resultado del propio ui-ux-pro-max (--domain typography, "B2B SaaS
// enterprise") para ese perfil exacto, descrito ahí mismo como "alternativa
// moderna a Inter" — se parece a la referencia sin ser Inter literal.
// Sistema de una sola familia (heading = body), como en la referencia.
// IBM Plex Mono se mantiene: es un detalle tipográfico aparte (ficha técnica
// de material/aplicación en el lightbox de /proyectos, ver
// ProyectosClient.tsx), no compite con esta decisión.
// Dos instancias de la misma familia (no una sola reusada): --font-heading y
// --font-body son variables CSS distintas que globals.css/tailwind.config.ts
// esperan siempre definidas por separado — reusar un único objeto de font
// dejaría --font-body sin valor y el body caería al fallback del navegador.
const jakartaHeadingFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-heading" });
const jakartaBodyFont = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
export const plexMonoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const fontPairings = {
  modern: { heading: poppinsFont, body: interFont },
  elegante: { heading: loraFont, body: workSansFont },
  amigable: { heading: quicksandFont, body: nunitoFont },
  lujo: { heading: playfairFont, body: interFont },
  estructural: { heading: jakartaHeadingFont, body: jakartaBodyFont },
} as const;

export type FontPairingKey = keyof typeof fontPairings;

export function getFontVariables(key: FontPairingKey): string {
  const pair = fontPairings[key];
  const mono = key === "estructural" ? ` ${plexMonoFont.variable}` : "";
  return `${pair.heading.variable} ${pair.body.variable}${mono}`;
}
