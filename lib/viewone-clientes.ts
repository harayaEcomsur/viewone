import { z } from "zod";
import { CLIENTE_LOGO } from "@/lib/viewone-data";
import { slugifyServicio } from "@/lib/viewone-slug";

// Clientes editables desde el panel: nombre + logo (archivo del repo o uno
// subido). `id` estable (no el nombre) para que renombrar un cliente no lo
// saque de las secciones del Home que lo tenían elegido.
export const clienteSchema = z.object({
  id: z.string().min(1).max(80),
  nombre: z.string().min(1).max(120),
  logo: z.string().max(2000), // "" = sin logo, se muestra el nombre como texto
});
export const clientesSchema = z.array(clienteSchema).max(200);
export type Cliente = z.infer<typeof clienteSchema>;

export function idCliente(nombre: string, usados: Iterable<string> = []): string {
  const ocupados = new Set(usados);
  const base = slugifyServicio(nombre) || "cliente";
  let id = base;
  for (let n = 2; ocupados.has(id); n++) id = `${base}-${n}`;
  return id;
}

// Formato anterior (solo nombres): el logo sale del mapa del código.
export function clientesDesdeNombres(nombres: string[]): Cliente[] {
  const usados: string[] = [];
  return nombres.map((nombre) => {
    const id = idCliente(nombre, usados);
    usados.push(id);
    return { id, nombre, logo: (CLIENTE_LOGO as Record<string, string | undefined>)[nombre] ?? "" };
  });
}
