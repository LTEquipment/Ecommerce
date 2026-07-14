import Link from "next/link";
import { CATEGORIES } from "@/lib/products";
import { COMPANY, telHref } from "@/lib/company";
import { ArrowRight } from "@/components/icons";

export const metadata = { title: "Page not found — L&T" };

const POPULAR = ["wok-range", "steamer", "roaster", "refrigeration"];

export default function NotFound() {
  const depts = CATEGORIES.filter((c) => POPULAR.includes(c.id));
  return (
    <div className="wrap content nf">
      <div className="nf-main">
        <div className="nf-num" aria-hidden="true">404</div>
        <span className="eyebrow">Page not found</span>
        <h1>This page isn&apos;t on the line.</h1>
        <p>
          The page you&apos;re looking for may have been moved, renamed, or is no longer
          available. Let&apos;s get you back to something useful.
        </p>
        <div className="nf-cta">
          <Link className="btn btn-primary btn-lg" href="/">Back to home</Link>
          <Link className="btn btn-line btn-lg" href="/products">
            Browse all equipment <ArrowRight />
          </Link>
        </div>
        <a className="nf-tel" href={telHref(COMPANY.mainPhone)}>
          <small>Need a hand? Spec support &amp; quotes</small>
          <b>{COMPANY.mainPhone}</b>
        </a>
      </div>

      <nav className="nf-depts" aria-label="Popular departments">
        <span className="nf-depts-lab">Popular departments</span>
        <ul>
          {depts.map((c) => (
            <li key={c.id}>
              <Link href={`/category/${c.id}`}>
                {c.name} <ArrowRight />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
