import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY, telHref } from "@/lib/company";

export const metadata = { title: "Vendors & Suppliers — L&T" };

const aside = (
  <div className="side-card doc-help">
    <h4>Vendor inquiries</h4>
    <p>Submit a line card and capabilities overview to our procurement team.</p>
    <a className="doc-help-tel" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
    <a className="doc-help-link" href={`mailto:${COMPANY.email}?subject=Vendor%20inquiry`}>{COMPANY.email}</a>
    <Link className="btn btn-line btn-block" href="/contact">Contact procurement</Link>
  </div>
);

export default function VendorsPage() {
  return (
    <PageShell
      title="Vendors & suppliers"
      eyebrow="Partner with us"
      intro="We work with component makers, material suppliers and service partners who share our standard for quality and reliability."
      aside={aside}
    >
      <h2>Who we partner with</h2>
      <ul>
        <li><strong>Materials</strong> — stainless steel, cast iron, ductile-iron chamber rings.</li>
        <li><strong>Components</strong> — burners, valves, controls, faucets, casters, refrigeration.</li>
        <li><strong>Services</strong> — logistics and freight, finishing, and field installation.</li>
      </ul>

      <h2>What we look for</h2>
      <ul>
        <li>Consistent quality with documented certifications (NSF, CSA, ETL where relevant).</li>
        <li>Reliable lead times and capacity to scale with our national growth.</li>
        <li>Transparent pricing and a track record with commercial-grade equipment.</li>
      </ul>

      <h2>How to become a vendor</h2>
      <p>
        Send a capabilities overview and line card to our procurement team using the contact panel.
        We review new suppliers on a rolling basis and will follow up if there&apos;s a fit.
      </p>
    </PageShell>
  );
}
