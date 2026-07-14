"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Crumb = { label: string; href?: string };

// Friendly labels for the top-level route segment (fallback when a page has no
// top breadcrumb of its own).
const LABELS: Record<string, string> = {
  products: "Products",
  category: "Departments",
  cart: "Cart",
  checkout: "Checkout",
  account: "Account",
  login: "Sign in",
  register: "Create account",
  contact: "Contact",
  about: "About",
  careers: "Careers",
  press: "Press",
  investors: "Investor Relations",
  leadership: "Leadership",
  locations: "Locations",
  financing: "Financing",
  vendors: "Vendors",
  faq: "FAQ",
  shipping: "Shipping",
  returns: "Returns",
  warranty: "Warranty",
  privacy: "Privacy Policy",
  terms: "Terms of Use",
  cookies: "Cookie Policy",
  accessibility: "Accessibility",
  "supply-chain": "Supply Chain Transparency",
  sustainability: "Sustainability",
};

const toLabel = (seg: string) =>
  LABELS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Apple-style contextual breadcrumb in the footer (hidden on the homepage).
 * Mirrors the page's own top breadcrumb when present — so on a product page it
 * shows "L&T › Category › Product name", not just the top-level section.
 */
export default function FooterBreadcrumb() {
  const path = usePathname() || "/";
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);

  useEffect(() => {
    // Prefer mirroring the page's top breadcrumb — it carries the real category
    // and product names that the URL slug (a SKU) doesn't.
    const top = document.querySelector("nav.crumbs");
    if (top) {
      const items: Crumb[] = [];
      top.querySelectorAll("a, .cur").forEach((el) => {
        const label = (el.textContent || "").trim();
        if (!label) return;
        const href = el.tagName === "A" ? el.getAttribute("href") || undefined : undefined;
        items.push({ label: label === "Home" ? "L&T" : label, href });
      });
      if (items.length) {
        setCrumbs(items);
        return;
      }
    }
    // Fallback: the top-level path segment only.
    const seg = path.split("/").filter(Boolean)[0];
    setCrumbs(seg ? [{ label: "L&T", href: "/" }, { label: toLabel(seg), href: `/${seg}` }] : []);
  }, [path]);

  if (crumbs.length === 0) return null;

  return (
    <nav className="foot-crumb" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={i} className="fc-item">
          {i > 0 && <span className="fc-sep" aria-hidden="true">›</span>}
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span className="fc-cur">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
