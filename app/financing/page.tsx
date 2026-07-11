import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY, telHref } from "@/lib/company";
import { Card } from "@/components/icons";

export const metadata = { title: "Trade Accounts & Financing — L&T" };

export default function FinancingPage() {
  return (
    <PageShell
      title="Trade accounts & financing"
      eyebrow="Ordering"
      intro="Open a trade account for contract pricing, terms and financing built for multi-unit operators."
    >
      <div className="callout">
        <Card />
        <p><strong>0% APR financing</strong> for approved trade accounts, plus contract pricing across the full Panda® line.</p>
      </div>
      <h2>Trade accounts</h2>
      <ul>
        <li>Contract and volume pricing across the full Panda® line.</li>
        <li>Order history, saved carts and faster checkout.</li>
        <li>A dedicated account manager for spec support and custom builds.</li>
      </ul>
      <p><Link href="/login?mode=register&trade=1">Open a trade account →</Link></p>

      <h2>Financing</h2>
      <p>
        Approved trade accounts can qualify for <strong>0% APR financing</strong> on equipment orders,
        plus leasing options for full-kitchen build-outs. Spread the cost of a new line across terms
        that match your ramp-up.
      </p>

      <h2>Bulk &amp; contract pricing</h2>
      <p>
        Outfitting several locations or a franchise program? We build custom contract price lists and
        coordinate freight across sites. <Link href="/contact">Request a quote</Link> and our team will
        put together pricing for your project.
      </p>

      <h2>Talk to us</h2>
      <p>
        Call <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a> or email{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <p className="doc-note">Financing subject to credit approval. Illustrative for a concept build.</p>
    </PageShell>
  );
}
