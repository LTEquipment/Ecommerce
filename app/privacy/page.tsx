import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Privacy Policy — L&T" };

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy policy"
      eyebrow="Last updated July 2026"
      intro="How L&T Restaurant Equipment collects, uses and protects your information."
    >
      <h2>Information we collect</h2>
      <ul>
        <li><strong>Account &amp; order information</strong> — name, company, email, phone, and shipping address you provide to register or place an order.</li>
        <li><strong>Payment information</strong> — processed by our payment provider; we do not store full card numbers.</li>
        <li><strong>Usage data</strong> — pages visited and device information collected through cookies to operate and improve the site.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To process orders, arrange freight, and provide support and warranty service.</li>
        <li>To manage trade accounts, contract pricing and financing.</li>
        <li>To send order updates and, with your consent, restock and pricing emails.</li>
      </ul>

      <h2>Sharing</h2>
      <p>
        We share information only with service providers who help us operate — freight carriers,
        payment processors and hosting — and when required by law. We do not sell your personal
        information.
      </p>

      <h2>Cookies</h2>
      <p>Your cart is stored in your browser. You can control cookies through your browser settings; disabling them may affect site functionality.</p>

      <h2>Security &amp; your rights</h2>
      <p>
        We use industry-standard safeguards to protect your data. You may request access, correction
        or deletion of your information at any time by emailing{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <h2>Contact</h2>
      <p>
        {COMPANY.legalName}, {COMPANY.hqAddress}. Questions? <Link href="/contact">Contact us</Link>.
      </p>
      <p className="doc-note">This policy is provided for a concept build and is not legal advice.</p>
    </PageShell>
  );
}
