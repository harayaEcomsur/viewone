import { ViewOneHeader } from "@/components/viewone/ViewOneHeader";
import { ViewOneFooter } from "@/components/viewone/ViewOneFooter";
import { ViewOneHome } from "@/components/viewone/ViewOneHome";

// Home a medida del handoff aprobado por ViewOne — ver components/viewone/*.
export default function HomePage() {
  return (
    <>
      <ViewOneHeader />
      <main>
        <ViewOneHome />
      </main>
      <ViewOneFooter />
    </>
  );
}
