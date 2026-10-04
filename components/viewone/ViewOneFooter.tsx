import { Instagram, Facebook, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { clientConfig } from "@/config/client.config";

// Footer minimalista del handoff (sección 10): separado por una línea fina,
// sin mezclarse con el bloque de contacto — ese vive dentro de cada página.
const SOCIAL_ICON = { instagram: Instagram, facebook: Facebook, linkedin: Linkedin } as const;

export function ViewOneFooter() {
  const { meta, contact } = clientConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-foreground/10 py-6">
      <Container className="flex flex-col items-center gap-3 text-center text-sm text-foreground/50 sm:flex-row sm:justify-between">
        <p>
          {meta.businessName} Chile · © {year} {meta.businessName}
        </p>
        <div className="flex items-center gap-4">
          {contact.socials?.map((s) => {
            const Icon = SOCIAL_ICON[s.platform as keyof typeof SOCIAL_ICON];
            if (!Icon) return null;
            return (
              <a key={s.platform} href={s.url} target="_blank" rel="noreferrer" aria-label={s.platform} className="hover:text-primary">
                <Icon size={16} />
              </a>
            );
          })}
        </div>
      </Container>
    </footer>
  );
}
