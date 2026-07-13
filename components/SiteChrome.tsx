"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Renders storefront chrome (header/footer/etc) everywhere except the admin console. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;
  return <>{children}</>;
}
