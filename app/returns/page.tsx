import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY, telHref } from "@/lib/company";
import { Package } from "@/components/icons";

export const metadata = { title: "Returns & Refunds — L&T" };

export default function ReturnsPage() {
  return (
    <PageShell
      title="Returns & refunds"
      eyebrow="Policy"
      intro="Our return policy for stocked commercial equipment and smallwares."
    >
      <div className="callout">
        <Package />
        <p><strong>30-day returns</strong> on new, unused stock items in original packaging. Custom-built equipment is final sale.</p>
      </div>
      <h2>Return window</h2>
      <p>
        Stock items in new, unused, resalable condition may be returned within <strong>30 days</strong> of
        delivery. Equipment must be in its original packaging with all documentation and accessories.
      </p>

      <h2>Restocking &amp; freight</h2>
      <ul>
        <li>A <strong>15% restocking fee</strong> applies to returned equipment.</li>
        <li>Return freight is the customer&apos;s responsibility unless the return is due to our error or a defect.</li>
        <li>Original freight charges are non-refundable.</li>
      </ul>

      <h2>Non-returnable items</h2>
      <ul>
        <li><strong>Custom-built and made-to-order</strong> wok ranges and equipment.</li>
        <li>Installed, used, or modified equipment.</li>
        <li>Clearance and final-sale items.</li>
      </ul>

      <h2>Damaged or defective on arrival</h2>
      <p>
        Note damage on the delivery receipt and contact us within 48 hours — see{" "}
        <Link href="/shipping">shipping &amp; freight</Link>. We&apos;ll arrange a replacement or repair at
        no cost. Defects are handled under our <Link href="/warranty">warranty</Link>.
      </p>

      <h2>Start a return</h2>
      <p>
        Call <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a> or email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> with your order number to request an RMA.
      </p>
      <p className="doc-note">Policy shown for a concept build.</p>
    </PageShell>
  );
}
