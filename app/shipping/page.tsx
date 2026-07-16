import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY, telHref } from "@/lib/company";
import { Truck } from "@/components/icons";

export const metadata = {
  title: "Shipping & Freight — L&T",
  description:
    "L&T ships heavy commercial kitchen equipment nationwide with free freight over $999; in-stock Panda® units leave our New York factory in 24–48 hours",
  alternates: { canonical: "/shipping" },
};

export default function ShippingPage() {
  return (
    <PageShell
      title="Shipping & freight"
      eyebrow="Delivery"
      intro="How L&T gets heavy commercial equipment to your door — fast, palletized and inspected."
    >
      <div className="callout">
        <Truck />
        <p><strong>Free freight on every order over $999.</strong> In-stock equipment ships in 24–48 hours from New York.</p>
      </div>
      <h2>Freight rates</h2>
      <ul>
        <li><strong>Free freight</strong> on orders over $999 (contiguous U.S.).</li>
        <li>A flat <strong>$89</strong> freight charge applies to orders under $999.</li>
        <li>Liftgate service and inside/threshold delivery are available on request — ask when you order.</li>
      </ul>

      <h2>Lead times</h2>
      <ul>
        <li><strong>In-stock equipment</strong> ships within <strong>24–48 hours</strong> of order confirmation.</li>
        <li><strong>Backordered items</strong> typically ship in 2–3 weeks; you&apos;ll see status on each product page.</li>
        <li><strong>Custom-built wok ranges</strong> are quoted with a production lead time — <Link href="/contact">contact us</Link> for a schedule.</li>
      </ul>

      <h2>Delivery &amp; inspection</h2>
      <p>
        Large equipment ships palletized by LTL freight carriers. Please inspect every shipment on
        arrival: note any visible damage on the delivery receipt before signing, and photograph the
        packaging. Reporting damage at delivery is required for a freight claim.
      </p>

      <h2>Questions about a shipment?</h2>
      <p>
        Call <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a> or email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Sign in to{" "}
        <Link href="/account">your account</Link> to track an order.
      </p>
      <p className="doc-note">Freight rates and lead times are estimates; final costs are confirmed on your quote.</p>
    </PageShell>
  );
}
