import { COMPANY, telHref } from "@/lib/company";

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <a className="brand" href="#">
              <span className="brand-logo" role="img" aria-label="L&T Kitchen Supply" />
            </a>
            <p className="fabout">
              Commercial kitchen equipment and supply for operators who run a real line.
              Spec&apos;d right, shipped fast, backed by chefs.
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
            <a href="#catalog">Cooking Equipment</a>
            <a href="#catalog">Refrigeration</a>
            <a href="#catalog">Prep &amp; Tables</a>
            <a href="#catalog">Smallwares</a>
            <a href="#catalog">Warming &amp; Holding</a>
            <a href="#catalog">Sinks &amp; Sanitation</a>
          </div>
          <div className="fcol">
            <h5>Ordering</h5>
            <a href="#">Trade accounts</a>
            <a href="#">Financing</a>
            <a href="#">Bulk pricing</a>
            <a href="#">Freight &amp; delivery</a>
            <a href="#">Returns</a>
          </div>
          <div className="fcol">
            <h5>Support</h5>
            <a href="#">Spec support</a>
            <a href="#">Track an order</a>
            <a href="#">Warranty &amp; parts</a>
            <a href="#">Installation</a>
            <a href="#locations">Locations</a>
          </div>
          <div className="fcol">
            <h5>Company</h5>
            <a href="#">About us</a>
            <a href="#locations">Showrooms</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 {COMPANY.legalName} — concept build</span>
          <span>NSF · CSA · ETL Listed · Energy Star Partner</span>
        </div>
      </div>
    </footer>
  );
}
