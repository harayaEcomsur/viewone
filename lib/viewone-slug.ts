// Slug consistente para anclas (/servicios#slug) y categorías (/proyectos?cat=slug).
export function slugifyServicio(nombre: string): string {
  return nombre
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}
