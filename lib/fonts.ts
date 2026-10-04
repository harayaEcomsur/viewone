import { Inter, Poppins, Lora, Work_Sans, Quicksand, Nunito, Playfair_Display, Archivo } from "next/font/google";

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

// Archivo + Inter: par recomendado por ui-ux-pro-max (--design-system "B2B
// impresión digital señalética publicidad exterior corporativo") para un
// rubro de estructuras/producción gráfica — geométrico y firme en vez del
// Poppins redondeado de "modern", sin caer en el navy/SaaS genérico.
const archivoFont = Archivo({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-heading" });

export const fontPairings = {
  modern: { heading: poppinsFont, body: interFont },
  elegante: { heading: loraFont, body: workSansFont },
  amigable: { heading: quicksandFont, body: nunitoFont },
  lujo: { heading: playfairFont, body: interFont },
  estructural: { heading: archivoFont, body: interFont },
} as const;

export type FontPairingKey = keyof typeof fontPairings;

export function getFontVariables(key: FontPairingKey): string {
  const pair = fontPairings[key];
  return `${pair.heading.variable} ${pair.body.variable}`;
}
