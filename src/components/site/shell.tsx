import type { ReactNode } from "react";
import { SiteFooter } from "./footer";
import { SiteHeader } from "./header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteHeader />
      <div className="relative">{children}</div>
      <SiteFooter />
    </div>
  );
}
