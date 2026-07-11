import Breadcrumbs from "@/components/Breadcrumbs";
import ContactForm from "@/components/ContactForm";
import { COMPANY, telHref } from "@/lib/company";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "@/components/icons";

export const metadata = { title: "Contact — L&T Restaurant Equipment" };

const mapsHref = "https://maps.google.com/?q=" + encodeURIComponent(COMPANY.hqAddress);

export default function ContactPage() {
  return (
    <div className="wrap content">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <header className="page-header">
        <span className="eyebrow">We&apos;re here to help</span>
        <h1>Talk to a spec specialist.</h1>
        <p>Bulk and contract pricing, custom wok chambers, freight questions — reach the team directly.</p>
      </header>

      <div className="contact-grid">
        <ContactForm />
        <div className="contact-cards">
          <div className="contact-card">
            <Phone />
            <div>
              <h3>Call us</h3>
              <a href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a><br />
              <a href={telHref(COMPANY.altPhone)}>{COMPANY.altPhone}</a>
            </div>
          </div>
          <div className="contact-card">
            <Mail />
            <div>
              <h3>Email</h3>
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
            </div>
          </div>
          <div className="contact-card">
            <Clock />
            <div>
              <h3>Hours</h3>
              <p>Mon–Fri 8:00–6:00 · Sat 9:00–2:00 ET</p>
            </div>
          </div>
          <div className="contact-card">
            <MapPin />
            <div>
              <h3>Corporate HQ &amp; factory</h3>
              <p>{COMPANY.hqAddress}</p>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" style={{ color: "var(--red)", fontWeight: 600, display: "inline-flex", gap: 5, alignItems: "center", marginTop: 4 }}>
                Get directions <ArrowRight style={{ width: 13, height: 13 }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
