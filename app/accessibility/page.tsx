import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Accessibility — L&T" };

export default function AccessibilityPage() {
  return (
    <PageShell
      title="Accessibility statement"
      eyebrow="Our commitment"
      intro="L&T Restaurant Equipment is committed to making ltfse.com usable for everyone, including people with disabilities."
    >
      <h2>Conformance target</h2>
      <p>
        We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, and we
        review the site on an ongoing basis as we grow.
      </p>

      <h2>What we do</h2>
      <ul>
        <li>Semantic HTML and ARIA labels so assistive technology can navigate the site.</li>
        <li>Full keyboard operability with visible focus indicators.</li>
        <li>Color contrast that meets AA on text and interactive controls.</li>
        <li>Descriptive alt text on product imagery and meaningful link text.</li>
        <li>Reduced-motion support for users who prefer it.</li>
      </ul>

      <h2>Feedback</h2>
      <p>
        If you encounter a barrier, tell us and we&apos;ll fix it. Email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call{" "}
        <a href={`tel:+1${COMPANY.mainPhone.replace(/\D/g, "")}`}>{COMPANY.mainPhone}</a> — we aim
        to respond within two business days.
      </p>
      <p className="doc-note">Statement provided for a concept build and reviewed periodically.</p>
    </PageShell>
  );
}
