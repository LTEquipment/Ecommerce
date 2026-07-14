import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "California Transparency in Supply Chains Act — L&T" };

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
      intro="L&T Restaurant Equipment's disclosure of the steps we take to address the risk of forced labor and human trafficking in our supply chain, in the spirit of the California Transparency in Supply Chains Act of 2010 (SB 657)."
      sections={SECTIONS}
    >
      <div className="tpl-banner">
        <b>Draft template.</b> Replace each highlighted placeholder with L&amp;T&apos;s actual
        practices, then delete this notice. Have counsel confirm the wording and whether the Act
        applies before publishing.
      </div>

      <p>
        {COMPANY.legalName} (&ldquo;L&amp;T&rdquo;) designs and manufactures the Panda&reg; line of
        commercial cooking equipment in New York. We are committed to conducting our business
        responsibly, and we believe forced labor and human trafficking have no place in our
        operations or in the supply chains that support them. This statement describes the steps we
        take in the five areas addressed by the Act.
      </p>

      <h2 id="verification">Verification</h2>
      <p>
        <em className="tpl-fill">
          [Describe whether and how L&amp;T verifies its product supply chains to evaluate and
          address risks of human trafficking and slavery, and state whether the verification is
          performed internally or by a third party.]
        </em>
      </p>

      <h2 id="audits">Supplier audits</h2>
      <p>
        <em className="tpl-fill">
          [Describe whether L&amp;T audits suppliers to evaluate compliance with our standards for
          trafficking and slavery, and whether those audits are independent and unannounced.]
        </em>
      </p>

      <h2 id="certification">Certification</h2>
      <p>
        <em className="tpl-fill">
          [Describe whether L&amp;T requires direct suppliers to certify that materials incorporated
          into our products comply with the laws on slavery and human trafficking of the countries
          in which they do business.]
        </em>
      </p>

      <h2 id="accountability">Internal accountability</h2>
      <p>
        <em className="tpl-fill">
          [Describe L&amp;T&apos;s internal accountability standards and procedures for employees or
          contractors who fail to meet company standards regarding slavery and trafficking.]
        </em>
      </p>

      <h2 id="training">Training</h2>
      <p>
        <em className="tpl-fill">
          [Describe the training L&amp;T provides to employees and management with direct
          responsibility for supply-chain management on human trafficking and slavery, including how
          to mitigate risks within the supply chains of products.]
        </em>
      </p>

      <h2 id="contact">Questions</h2>
      <p>
        Questions about this disclosure may be directed to{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or {COMPANY.mainPhone}.
      </p>
    </PageShell>
  );
}
