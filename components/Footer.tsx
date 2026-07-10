import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";
import { CATEGORIES } from "@/lib/products";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link className="brand" href="/">
              <span className="brand-logo" role="img" aria-label="L&T Restaurant Equipment" />
            </Link>
            <p className="fabout">
              Panda® commercial cooking equipment — designed, built and serviced in New York for
              operators who run a real line.
            </p>
            <div className="faddr">
              {COMPANY.legalName}
              <br />
              {COMPANY.hqAddress}
            </div>
            <div className="fphone">
              <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
            </div>
          </div>
          <div className="fcol">
            <h5>Departments</h5>
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/category/${c.id}`}>{c.name}</Link>
            ))}
          </div>
          <div className="fcol">
            <h5>Ordering</h5>
            <Link href="/register">Trade accounts</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/contact">Bulk pricing</Link>
            <Link href="/contact">Freight &amp; delivery</Link>
          </div>
          <div className="fcol">
            <h5>Support</h5>
            <Link href="/contact">Spec support</Link>
            <Link href="/account">Track an order</Link>
            <Link href="/contact">Warranty &amp; parts</Link>
            <Link href="/locations">Locations</Link>
          </div>
          <div className="fcol">
            <h5>Company</h5>
            <Link href="/about">About us</Link>
            <Link href="/locations">Showrooms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 {COMPANY.legalName} — concept build</span>
          <span>NSF · CSA · ETL Listed · Made in New York</span>
        </div>
      </div>
    </footer>
  );
}
