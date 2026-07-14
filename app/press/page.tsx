import Breadcrumbs from "@/components/Breadcrumbs";
import EditorialHero from "@/components/EditorialHero";
import { BRAND } from "@/lib/brand";
import { COMPANY, telHref } from "@/lib/company";

export const metadata = { title: "Press & Newsroom — L&T" };

export default function PressPage() {
  return (
    <>
      <EditorialHero
        kicker="Media"
        title="Press & newsroom"
        lede="News, milestones and media resources from L&T Restaurant Equipment — the Panda® brand, built in New York."
      />

      <div className="wrap content" style={{ paddingTop: "var(--s6)" }}>
        <Breadcrumbs items={[{ label: "Press" }]} />

        {/* Recent milestones — dated news feed */}
        <span className="ss-lab">Recent milestones</span>
        <div className="ir-news">
          {BRAND.milestones.map((m) => (
            <article className="ir-news-item" key={m.text}>
              <span className="ir-news-date">{m.year}</span>
              <h3>{m.text}</h3>
            </article>
          ))}
        </div>

        {/* About L&T */}
        <section className="pgsec">
          <span className="pg-eyebrow">About L&amp;T</span>
          <h2>Four decades of professional kitchens.</h2>
          <p className="pg-body">{BRAND.story}</p>
        </section>

        {/* Press kit */}
        <section className="pgsec">
          <span className="pg-eyebrow">Press kit</span>
          <h2>Materials for your story.</h2>
          <p className="pg-body">
            Logos, product photography and executive bios are available on request. Email{" "}
            <a href={`mailto:${COMPANY.email}?subject=Press%20kit`}>{COMPANY.email}</a> and we&apos;ll
            send materials for your story.
          </p>
        </section>

        {/* Media inquiries */}
        <section className="cta-band">
          <span className="pg-eyebrow">Media inquiries</span>
          <h2>Talk to our communications team.</h2>
          <p>For interviews, imagery or a press kit, reach us directly.</p>
          <div className="hero-cta" style={{ justifyContent: "center" }}>
            <a className="btn btn-primary btn-lg" href={`mailto:${COMPANY.email}?subject=Press%20inquiry`}>Contact us</a>
            <a className="btn btn-line btn-lg" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
          </div>
        </section>
      </div>
    </>
  );
}
