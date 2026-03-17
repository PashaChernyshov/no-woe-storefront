import type { ReactNode } from "react";
import SiteBreadcrumbs from "@/components/SiteBreadcrumbs";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

type StoreFrameProps = {
  children: ReactNode;
};

export default function StoreFrame({ children }: StoreFrameProps) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <main className="site-main">
        <div className="container">
          <SiteBreadcrumbs />
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
