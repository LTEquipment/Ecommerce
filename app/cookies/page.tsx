import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Cookie Policy — L&T" };

export default function CookiesPage() {
  return (
    <PageShell
      title="Cookie policy"
      eyebrow="Last updated July 2026"
      intro="How L&T uses cookies and similar technologies on ltfse.com."
    >
      <h2>What cookies are</h2>
      <p>
        Cookies are small text files stored on your device that help a site function and remember
        your preferences. Similar technologies include local storage, which we use to keep your cart.
      </p>

      <h2>How we use them</h2>
      <ul>
        <li><strong>Essential</strong> — keep you signed in, hold your cart, and secure checkout. These can&apos;t be turned off.</li>
        <li><strong>Preferences</strong> — remember choices like recently viewed departments.</li>
        <li><strong>Analytics</strong> — understand which products and pages are used, so we can improve the site.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>
        You can control or delete cookies in your browser settings; disabling essential cookies may
        break parts of the site. Your cart is stored in your browser&apos;s local storage and never
        leaves your device unless you place an order.
      </p>

      <h2>More information</h2>
      <p>
        See our <Link href="/privacy">privacy policy</Link> for how we handle personal data, or email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with questions.
      </p>
    </PageShell>
  );
}
