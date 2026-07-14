"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Friendly labels for the top-level route segment.
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

function label(seg: string) {
  return LABELS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Apple-style contextual breadcrumb in the footer (hidden on the homepage). */
export default function FooterBreadcrumb() {
  const path = usePathname() || "/";
  const seg = path.split("/").filter(Boolean)[0];
  if (!seg) return null; // homepage — no breadcrumb

  return (
    <nav className="foot-crumb" aria-label="Breadcrumb">
      <Link href="/">L&amp;T</Link>
      <span className="fc-sep" aria-hidden="true">›</span>
      <Link href={`/${seg}`}>{label(seg)}</Link>
    </nav>
  );
}
