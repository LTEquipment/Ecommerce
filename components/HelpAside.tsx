import Link from "next/link";
import { COMPANY, telHref } from "@/lib/company";
import DocToc from "./DocToc";

export type TocItem = { id: string; label: string };

export default function HelpAside({ sections }: { sections?: TocItem[] }) {
  return (
    <>
      {sections && sections.length > 0 && <DocToc sections={sections} />}
      <div className="side-card doc-help">
        <h4>Talk to a specialist</h4>
        <p>Questions on spec, freight or trade accounts? Our New York team can help.</p>
        <a className="doc-help-tel" href={telHref(COMPANY.mainPhone)}>{COMPANY.mainPhone}</a>
        <a className="doc-help-link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        <Link className="btn btn-line btn-block" href="/contact">Contact us</Link>
      </div>
    </>
  );
}
