import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY, telHref } from "@/lib/company";
import { Shield } from "@/components/icons";

export const metadata = { title: "Warranty & Parts — L&T" };

export default function WarrantyPage() {
  return (
    <PageShell
      title="Warranty & parts"
      eyebrow="Support"
      intro="Every Panda® unit is line-tested and backed by a warranty, with parts and service from our New York factory."
    >
      <div className="callout">
        <Shield />
        <p><strong>One-year parts &amp; labor warranty</strong> on Panda®-built equipment, with parts and service direct from our factory.</p>
      </div>
      <h2>Coverage</h2>
      <p>
        Panda®-manufactured equipment carries a <strong>one-year parts and labor warranty</strong> against
        defects in materials and workmanship from the date of delivery, plus an additional limited
        warranty on burners and stainless chambers. Third-party brands we distribute carry their
        manufacturer&apos;s warranty.
      </p>

      <h2>What&apos;s covered</h2>
      <ul>
        <li>Defects in materials and factory workmanship.</li>
        <li>Failed components under normal commercial use — burners, valves, controls, chambers.</li>
        <li>Replacement parts sourced directly from our factory.</li>
      </ul>

      <h2>What&apos;s not covered</h2>
      <ul>
        <li>Damage from improper installation, misuse, or lack of maintenance.</li>
        <li>Normal wear items and cosmetic wear.</li>
        <li>Equipment altered or repaired by unauthorized parties.</li>
      </ul>

      <h2>Certified &amp; listed</h2>
      <p>Our equipment is <strong>NSF</strong>, <strong>CSA</strong> and <strong>ETL</strong> listed — full certifications appear on each product&apos;s specifications.</p>

      <h2>File a claim or order parts</h2>
      <p>
        Call <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a> or email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your model number and order details.
        See our <Link href="/locations">locations</Link> for in-person service.
      </p>
    </PageShell>
  );
}
