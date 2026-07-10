import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { COMPANY, telHref } from "@/lib/company";
import { Phone, Mail, MapPin } from "@/components/icons";

export const metadata = { title: "Contact — L&T Restaurant Equipment" };

export default function ContactPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="lede-head">
        <span className="eyebrow">We&apos;re here to help</span>
        <h1>Talk to a spec specialist.</h1>
        <p>Bulk and contract pricing, custom wok chambers, freight questions — reach the team directly.</p>
      </div>

      <div className="contact-grid">
        <ContactForm />
        <div style={{ display: "grid", gap: "var(--s3)" }}>
          <div className="valuecard" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Phone style={{ width: 20, height: 20, color: "var(--red)", flex: "0 0 auto" }} />
            <div>
              <h3 style={{ margin: 0 }}>Call us</h3>
              <p style={{ margin: "4px 0 0" }}>
                <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a><br />
                <a href={telHref(COMPANY.altPhone)}>{COMPANY.altPhone}</a>
              </p>
            </div>
          </div>
          <div className="valuecard" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Mail style={{ width: 20, height: 20, color: "var(--red)", flex: "0 0 auto" }} />
            <div>
              <h3 style={{ margin: 0 }}>Email</h3>
              <p style={{ margin: "4px 0 0" }}><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
            </div>
          </div>
          <div className="valuecard" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <MapPin style={{ width: 20, height: 20, color: "var(--red)", flex: "0 0 auto" }} />
            <div>
              <h3 style={{ margin: 0 }}>Corporate HQ &amp; factory</h3>
              <p style={{ margin: "4px 0 0" }}>{COMPANY.hqAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
