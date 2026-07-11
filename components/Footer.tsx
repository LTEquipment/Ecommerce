import Link from "next/link";
import { Fragment, type SVGProps } from "react";
import { COMPANY, SOCIALS, telHref } from "@/lib/company";
import { CATEGORIES } from "@/lib/products";
import { TrendingUp, ArrowRight, XSocial, Facebook, TikTok, Pinterest, Youtube, Xiaohongshu } from "./icons";

const SOCIAL_ICON: Record<string, (p: SVGProps<SVGSVGElement>) => JSX.Element> = {
  TikTok,
  Facebook,
  Pinterest,
  X: XSocial,
  YouTube: Youtube,
  Xiaohongshu,
};

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        {/* Investor Relations callout */}
        <div className="ir-callout">
          <div>
            <span className="eyebrow"><TrendingUp style={{ width: 14, height: 14, display: "inline", verticalAlign: "-2px", marginRight: 6 }} /> Investor Relations</span>
            <h3>We&apos;re building L&amp;T for the public markets.</h3>
            <p>Four decades of Made-in-New-York manufacturing, a growing national footprint, and a brand trusted by the kitchens you know. Explore our investor relations.</p>
          </div>
          <Link className="btn" href="/investors">
            Investor relations <ArrowRight />
          </Link>
        </div>

        <div className="foot-grid">
          <div className="foot-brand">
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

          <div className="foot-nav">
          <div className="fcol">
            <h5>Departments</h5>
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/category/${c.id}`}>{c.name}</Link>
            ))}
          </div>
          <div className="fcol">
            <h5>Ordering</h5>
            <Link href="/login?mode=register&trade=1">Trade accounts</Link>
            <Link href="/financing">Financing &amp; pricing</Link>
            <Link href="/shipping">Shipping &amp; freight</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/vendors">Become a vendor</Link>
          </div>
          <div className="fcol">
            <h5>Support</h5>
            <Link href="/faq">FAQ</Link>
            <Link href="/warranty">Warranty &amp; parts</Link>
            <Link href="/account">Track an order</Link>
            <Link href="/contact">Spec support</Link>
          </div>
          <div className="fcol">
            <h5>Investors</h5>
            <Link href="/investors">Investor relations</Link>
            <Link href="/investors#highlights">Company highlights</Link>
            <Link href="/investors#governance">Corporate governance</Link>
            <Link href="/contact">Contact IR</Link>
          </div>
          <div className="fcol">
            <h5>Company</h5>
            <Link href="/about">About us</Link>
            <Link href="/leadership">Leadership</Link>
            <Link href="/press">Press</Link>
            <Link href="/sustainability">Sustainability</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/locations">Showrooms</Link>
            <Link href="/contact">Contact</Link>
          </div>
          </div>
        </div>

        <div className="foot-bot">
          <div className="fb-legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
            <Link href="/cookies">Cookie Policy</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/investors">Investor Relations</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </div>
          <div className="fb-base">
            <div className="fb-copy">
              <span>© 2026 {COMPANY.legalName} All rights reserved.</span>
              <span className="fb-certs">NSF · CSA · ETL Listed · Designed &amp; made in New York</span>
            </div>
            <div className="socials" aria-label="Follow L&T">
              <span className="soc-label">Follow us</span>
              {SOCIALS.map((s, i) => {
                const Icon = SOCIAL_ICON[s.name];
                return (
                  <Fragment key={s.name}>
                    {i === 4 && <span className="soc-div" aria-hidden="true" />}
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>
                      <Icon />
                    </a>
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
