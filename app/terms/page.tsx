import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Terms of Use — L&T" };

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of use"
      eyebrow="Last updated July 2026"
      intro="The terms that govern your use of ltfse.com and purchases from L&T Restaurant Equipment."
    >
      <h2>Acceptance</h2>
      <p>By accessing this site or placing an order, you agree to these terms. If you do not agree, please do not use the site.</p>

      <h2>Orders &amp; pricing</h2>
      <ul>
        <li>Prices, specifications and availability are subject to change without notice.</li>
        <li>We may decline or cancel an order, including for pricing errors, and will refund any charge.</li>
        <li>Contract and trade-account pricing is governed by your account agreement.</li>
      </ul>

      <h2>Shipping, returns &amp; warranty</h2>
      <p>
        Freight, returns and warranty are governed by our <Link href="/shipping">shipping</Link>,{" "}
        <Link href="/returns">returns</Link> and <Link href="/warranty">warranty</Link> policies, which
        form part of these terms.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Panda® brand, site content, product designs and imagery are the property of{" "}
        {COMPANY.legalName} and may not be used without permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, L&amp;T is not liable for indirect or consequential
        damages arising from use of the site or products. Nothing limits liability that cannot be
        excluded under applicable law.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the State of New York.</p>

      <h2>Contact</h2>
      <p>{COMPANY.legalName}, {COMPANY.hqAddress}. <Link href="/contact">Contact us</Link>.</p>
      <p className="doc-note">Provided for a concept build and not legal advice.</p>
    </PageShell>
  );
}
