import Link from "next/link";
import { Fragment, type SVGProps, type ReactElement } from "react";
import { COMPANY, SOCIALS, telHref } from "@/lib/company";
import { getSiteSettings } from "@/lib/settings";
import { CATEGORIES } from "@/lib/products";
import { XSocial, Facebook, TikTok, Pinterest, Youtube, Xiaohongshu, Phone, Chat } from "./icons";
import CookiePrefsButton from "./CookiePrefsButton";
import BackToTop from "./BackToTop";
import FooterBreadcrumb from "./FooterBreadcrumb";

const SOCIAL_ICON: Record<string, (p: SVGProps<SVGSVGElement>) => ReactElement> = {
  TikTok,
  Facebook,
  Pinterest,
  X: XSocial,
  YouTube: Youtube,
  Xiaohongshu,
};

export default async function Footer() {
  const { investorRelationsEnabled } = await getSiteSettings();
  return (
    <footer>
      <div className="support-bar">
        <div className="wrap support-bar-in">
          <div className="support-info">
            <span className="support-lead">Our specialists are here to help</span>
            <a className="support-contact" href={telHref(COMPANY.mainPhone)}>
              <Phone /> {COMPANY.mainPhone}
            </a>
            <Link className="support-contact" href="/contact">
              <Chat /> Contact us
            </Link>
          </div>
          <BackToTop />
        </div>
      </div>
      <div className="wrap">
        <div className="foot-notes">
          <p>
            Prices, specifications, features, and availability are subject to change without notice.
            Product images and illustrations are provided for reference and may not reflect exact
            configurations. Freight, lead times, and applicable taxes are estimated and confirmed on
            your quote.
          </p>
          <p>
            Panda® and the L&amp;T logo are trademarks of {COMPANY.legalName}. NSF, CSA, and ETL are
            marks of their respective certification bodies. All other trademarks are the property of
            their respective owners.
          </p>
          {investorRelationsEnabled && (
            <p>
              Statements regarding L&amp;T&apos;s growth and plans, including any future public listing,
              are forward-looking, reflect current expectations, and are not guarantees of future
              results. Nothing on this site constitutes an offer to sell, or a solicitation of an offer
              to buy, any securities.
            </p>
          )}
        </div>

        <FooterBreadcrumb />

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

          <div className={`foot-nav${investorRelationsEnabled ? "" : " cols-4"}`}>
          <div className="fcol">
            <h5>Departments</h5>
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/category/${c.id}`}>{c.name}</Link>
            ))}
            <Link href="/brands">Shop by brand</Link>
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
            <Link href="/guides">Equipment guides</Link>
            <Link href="/warranty">Warranty &amp; parts</Link>
            <Link href="/account">Track an order</Link>
            <Link href="/contact">Spec support</Link>
          </div>
          {investorRelationsEnabled && (
          <div className="fcol">
            <h5>Investors</h5>
            <Link href="/investors">Investor relations</Link>
            <Link href="/investors#highlights">Company highlights</Link>
            <Link href="/investors#governance">Corporate governance</Link>
            <Link href="/investors#contact">Contact IR</Link>
          </div>
          )}
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
            <Link href="/supply-chain">Supply Chain Transparency</Link>
            {investorRelationsEnabled && <Link href="/investors">Investor Relations</Link>}
            <a href="/sitemap.xml">Sitemap</a>
            <CookiePrefsButton />
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
