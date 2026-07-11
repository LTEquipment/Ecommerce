import Link from "next/link";
import PageShell from "@/components/PageShell";
import { BRAND } from "@/lib/brand";
import { COMPANY, telHref } from "@/lib/company";

export const metadata = { title: "Press & Newsroom — L&T" };

const aside = (
  <div className="side-card doc-help">
    <h4>Media inquiries</h4>
    <p>For interviews, imagery or a press kit, reach our communications team.</p>
    <a className="doc-help-tel" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
    <a className="doc-help-link" href={`mailto:${COMPANY.email}?subject=Press%20inquiry`}>{COMPANY.email}</a>
    <Link className="btn btn-line btn-block" href="/contact">Contact us</Link>
  </div>
);

export default function PressPage() {
  return (
    <PageShell
      title="Press & newsroom"
      eyebrow="Media"
      intro="News, milestones and media resources from L&T Restaurant Equipment — the Panda® brand, built in New York."
      aside={aside}
    >
      <h2>Recent milestones</h2>
      <ul>
        {BRAND.milestones.map((m) => (
          <li key={m.text}><strong>{m.year}</strong> — {m.text}</li>
        ))}
      </ul>

      <h2>About L&amp;T</h2>
      <p>{BRAND.story}</p>

      <h2>Press kit</h2>
      <p>
        Logos, product photography and executive bios are available on request. Email{" "}
        <a href={`mailto:${COMPANY.email}?subject=Press%20kit`}>{COMPANY.email}</a> and we&apos;ll
        send materials for your story.
      </p>
      <p className="doc-note">Newsroom shown for a concept build; milestones are illustrative.</p>
    </PageShell>
  );
}
