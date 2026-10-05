import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) en vez de var(--x) a secas: es el
        // formato que necesita Tailwind para poder generar las variantes de
        // opacidad (/70, /10, etc.) de estos colores — ver app/globals.css.
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        // Fallback inline (no lista con comas) porque un --font-mono sin
        // definir invalida TODO el valor de font-family en vez de caer al
        // siguiente ítem — ver nota de --font-heading/--font-body en
        // globals.css sobre esta misma trampa.
        mono: ["var(--font-mono, ui-monospace)", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
