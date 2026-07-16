import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: "California Transparency in Supply Chains Act — L&T",
  description:
    "L&T's disclosure under the California Transparency in Supply Chains Act on forced labor and human trafficking risk in our made-in-NYC Panda® supply chain",
  alternates: { canonical: "/supply-chain" },
};

const SECTIONS = [
  { id: "verification", label: "Verification" },
  { id: "audits", label: "Supplier audits" },
  { id: "certification", label: "Certification" },
  { id: "accountability", label: "Internal accountability" },
  { id: "training", label: "Training" },
  { id: "contact", label: "Questions" },
];

export default function SupplyChainPage() {
  return (
    <PageShell
      title="California Transparency in Supply Chains Act"
      eyebrow="Supply chain disclosure"
      intro="L&T Restaurant Equipment's disclosure of the steps we take to address the risk of forced labor and human trafficking in our supply chain, made in the spirit of the California Transparency in Supply Chains Act of 2010 (SB 657)."
      sections={SECTIONS}
    >
      <div className="tpl-banner">
        <b>Draft for review.</b> Confirm every statement below reflects L&amp;T&apos;s actual
        sourcing and practices — and have counsel review — before publishing.
      </div>

      <p>
        {COMPANY.legalName} (&ldquo;L&amp;T&rdquo;) designs and manufactures the Panda&reg; line of
        commercial cooking equipment at our own facility in New York. We are committed to conducting
        our business lawfully and responsibly, and we believe forced labor and human trafficking have
        no place in our operations or in the supply chains that support them. This statement
        describes the steps we take in the five areas addressed by the Act.
      </p>

      <h2 id="verification">Verification</h2>
      <p>
        L&amp;T produces the Panda&reg; line through vertically integrated, made-in-New-York
        manufacturing and sources a substantial share of its materials and components from suppliers
        based in the United States. Domestic, in-house production limits our direct exposure to the
        regions most commonly associated with forced labor and human trafficking. As part of
        selecting and continuing to work with suppliers, L&amp;T evaluates supplier risk internally
        and favors established vendors with a record of lawful, ethical operation. L&amp;T does not
        currently engage a third party to verify its product supply chains for these risks.
      </p>

      <h2 id="audits">Supplier audits</h2>
      <p>
        L&amp;T maintains direct, long-standing relationships with its key suppliers and reviews
        their quality, reliability, and conduct on an ongoing basis. If a concern about labor
        practices arises, L&amp;T will investigate and may require corrective action or end the
        relationship. L&amp;T does not currently conduct formal independent or unannounced audits of
        suppliers specifically for slavery and human trafficking, and will assess introducing a
        formal audit program as our supplier base grows.
      </p>

      <h2 id="certification">Certification</h2>
      <p>
        L&amp;T requires its direct suppliers to comply with all applicable laws, including the laws
        addressing slavery and human trafficking of the countries in which they operate. L&amp;T may
        request that direct suppliers certify in writing that the materials incorporated into our
        products comply with those laws, and reserves the right to discontinue any supplier that
        cannot provide that assurance.
      </p>

      <h2 id="accountability">Internal accountability</h2>
      <p>
        L&amp;T expects its employees and contractors to act lawfully and ethically. Conduct that
        violates the law or company policy — including any involvement in, or tolerance of, forced
        labor or human trafficking — is grounds for disciplinary action up to and including
        termination of employment or of the business relationship. Employees may raise concerns to
        L&amp;T management without fear of retaliation.
      </p>

      <h2 id="training">Training</h2>
      <p>
        L&amp;T operates primarily from a single New York facility with a small purchasing team that
        works closely with a stable supplier base. We make the personnel responsible for purchasing
        and supplier management aware of the risks of forced labor and human trafficking and of
        L&amp;T&apos;s expectation that suppliers operate lawfully. L&amp;T does not currently
        maintain a formal, dedicated training program on human trafficking, and will evaluate
        implementing one as our operations and supplier base expand.
      </p>

      <h2 id="contact">Questions</h2>
      <p>
        Questions about this disclosure may be directed to{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or {COMPANY.mainPhone}.
      </p>
    </PageShell>
  );
}
