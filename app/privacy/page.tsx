import Link from "next/link";
import PageShell from "@/components/PageShell";
import { COMPANY } from "@/lib/company";

export const metadata = {
  title: "Privacy Policy — L&T Restaurant Equipment",
  description:
    "How L&T Restaurant Equipment collects, uses, and protects your personal information on ltfse.com, including cookies, privacy choices, and state rights",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  { id: "scope", label: "Scope of this policy" },
  { id: "collect", label: "Information we collect" },
  { id: "use", label: "How we use information" },
  { id: "cookies", label: "Cookies & tracking" },
  { id: "share", label: "How we share information" },
  { id: "choices", label: "Your choices & rights" },
  { id: "california", label: "California privacy rights" },
  { id: "states", label: "Other U.S. state rights" },
  { id: "retention", label: "Data retention" },
  { id: "security", label: "Data security" },
  { id: "children", label: "Children's privacy" },
  { id: "thirdparty", label: "Third-party links" },
  { id: "changes", label: "Changes to this policy" },
  { id: "contact", label: "Contact us" },
];

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy policy"
      eyebrow="Last updated July 2026"
      intro="This Privacy Policy explains how L&T Restaurant Equipment collects, uses, discloses, and protects personal information when you visit ltfse.com, place an order, open a trade account, or otherwise interact with us."
      sections={SECTIONS}
    >
      <h2 id="scope">Scope of this policy</h2>
      <p>
        {COMPANY.legalName} (&ldquo;L&amp;T,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) respects your privacy. This policy applies to personal information we
        collect through our website at ltfse.com and related pages (the &ldquo;Site&rdquo;), through
        our sales, trade-account, financing, warranty, and support services, and when you contact us
        by phone or email (together, the &ldquo;Services&rdquo;). It does not apply to third-party
        websites or services that we do not control. Where we use the word &ldquo;including,&rdquo; it
        means &ldquo;including but not limited to.&rdquo;
      </p>

      <h2 id="collect">Information we collect</h2>
      <p>We collect the following categories of information:</p>
      <p><strong>Information you provide to us.</strong></p>
      <ul>
        <li><strong>Account information</strong> — the email address and password you use to register, and, for trade accounts, your company name, role, and dealer status.</li>
        <li><strong>Order and shipping information</strong> — your name, company, phone number, billing and shipping addresses, and the products you order.</li>
        <li><strong>Payment information</strong> — payment card or financing details, which are collected and processed by our payment providers. We do not store full payment card numbers on our systems.</li>
        <li><strong>Communications</strong> — the contents of quote requests, contact forms, warranty claims, service tickets, and other messages you send us, along with your contact details.</li>
        <li><strong>Marketing preferences</strong> — the email address you provide to subscribe to our newsletter and your communication choices.</li>
      </ul>
      <p><strong>Information we collect automatically.</strong></p>
      <ul>
        <li><strong>Device and usage data</strong> — IP address, browser type, device identifiers, pages viewed, referring pages, and interactions with the Site, collected through cookies and similar technologies.</li>
        <li><strong>Approximate location</strong> — a general location derived from your IP address (we do not collect precise geolocation).</li>
        <li><strong>Local storage</strong> — your shopping cart, recently viewed items, and cookie-consent choices are stored in your browser and remain on your device unless you place an order.</li>
      </ul>
      <p><strong>Information from other sources.</strong> We may receive information from our service providers, such as order and delivery status from freight carriers and transaction results from our payment providers.</p>

      <h2 id="use">How we use information</h2>
      <ul>
        <li>To create and manage your account, trade account, and contract or financing terms.</li>
        <li>To process, fulfill, and ship your orders, arrange freight, and provide warranty and after-sales service.</li>
        <li>To respond to quote requests, support inquiries, and other communications.</li>
        <li>To send transactional messages such as order confirmations and shipping updates.</li>
        <li>To send marketing communications, including restock and pricing emails, where you have consented, and to let you opt out at any time.</li>
        <li>To operate, secure, maintain, and improve the Site and our Services, including preventing fraud and abuse.</li>
        <li>To comply with legal obligations and enforce our terms and agreements.</li>
      </ul>

      <h2 id="cookies">Cookies &amp; tracking technologies</h2>
      <p>
        We use cookies and similar technologies to operate the Site and, with your consent, to
        understand usage and support marketing. We group them into three categories, which you can
        manage through the <strong>&ldquo;Your Privacy Choices&rdquo;</strong> link in our footer:
      </p>
      <ul>
        <li><strong>Strictly necessary</strong> — required to run the Site, keep you signed in, hold your cart, and secure checkout. These cannot be switched off.</li>
        <li><strong>Analytics</strong> — help us understand which products and pages are used so we can improve the Site. These are set only with your consent.</li>
        <li><strong>Marketing</strong> — used to measure campaigns and show relevant offers. These are set only with your consent.</li>
      </ul>
      <p>
        You can also control cookies through your browser settings; disabling strictly necessary
        cookies may break parts of the Site. For more detail, see our{" "}
        <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2 id="share">How we share information</h2>
      <p>We share personal information only as described here:</p>
      <ul>
        <li><strong>Service providers</strong> — vendors who perform services on our behalf, such as website and database hosting, payment processing, financing, freight and delivery, and email delivery. They may use your information only to provide those services.</li>
        <li><strong>Legal and safety</strong> — when required by law, subpoena, or legal process, or to protect the rights, property, or safety of L&amp;T, our customers, or others.</li>
        <li><strong>Business transfers</strong> — in connection with a merger, acquisition, financing, public offering, reorganization, or sale of assets, your information may be transferred as part of that transaction, subject to this policy.</li>
      </ul>
      <p>
        <strong>We do not sell your personal information for money.</strong> To the extent we use
        analytics or advertising technologies that could be considered &ldquo;sharing&rdquo; or a
        &ldquo;sale&rdquo; under certain state laws, you can control them through the Analytics and
        Marketing toggles in Your Privacy Choices.
      </p>

      <h2 id="choices">Your choices &amp; rights</h2>
      <ul>
        <li><strong>Access, correction, and deletion</strong> — when signed in, you can <a href="/account">download a copy of your data and request account deletion</a> directly from your account, and update your details there. Account deletion is a reviewed request — we confirm it by email and retain records we are legally required to keep. You may also request access, correction, or deletion by emailing <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</li>
        <li><strong>Account</strong> — you can review and update your account and order details when signed in.</li>
        <li><strong>Marketing</strong> — you can unsubscribe from marketing emails using the link in any such email, or by contacting us.</li>
        <li><strong>Cookies</strong> — you can manage analytics and marketing cookies through Your Privacy Choices, and control cookies in your browser.</li>
      </ul>
      <p>We will not discriminate against you for exercising any of these rights.</p>

      <h2 id="california">California privacy rights</h2>
      <p>
        If you are a California resident, the California Consumer Privacy Act, as amended (the
        &ldquo;CCPA&rdquo;), gives you the right to know what personal information we collect, use,
        and disclose; to request access to and deletion of that information; to correct inaccurate
        information; and to opt out of the &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal
        information. As stated above, we do not sell your personal information, and you can control
        analytics and marketing technologies through Your Privacy Choices.
      </p>
      <p>
        In the preceding 12 months, we have collected the categories of personal information
        described in <a href="#collect">Information we collect</a> — including identifiers, customer
        records, commercial information, internet or network activity, and approximate geolocation —
        for the business purposes described in <a href="#use">How we use information</a>. To exercise
        your rights, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We will verify
        your request against information in our records, and you may use an authorized agent to submit
        a request on your behalf.
      </p>

      <h2 id="states">Other U.S. state privacy rights</h2>
      <p>
        Residents of Virginia, Colorado, Connecticut, Utah, and other states with comprehensive
        privacy laws may have similar rights to access, correct, delete, and obtain a portable copy
        of their personal information, and to opt out of targeted advertising and the sale of personal
        information. To exercise these rights, contact us at{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Where required, you may appeal a
        decision on your request by replying to our response.
      </p>

      <h2 id="retention">Data retention</h2>
      <p>
        We retain personal information for as long as necessary to provide the Services, maintain your
        account, and fulfill the purposes described in this policy, and thereafter as needed to comply
        with our legal obligations, resolve disputes, and enforce our agreements. Retention periods
        vary based on the type of information and the context in which it was collected.
      </p>

      <h2 id="security">Data security</h2>
      <p>
        We maintain reasonable administrative, technical, and physical safeguards designed to protect
        personal information against unauthorized access, use, alteration, and disclosure. No method
        of transmission over the internet or method of electronic storage is completely secure,
        however, and we cannot guarantee absolute security.
      </p>

      <h2 id="children">Children&apos;s privacy</h2>
      <p>
        Our Services are intended for businesses and adults and are not directed to children. We do
        not knowingly collect personal information from children under 16. If you believe a child has
        provided us personal information, please contact us and we will take appropriate steps to
        delete it.
      </p>

      <h2 id="thirdparty">Third-party links &amp; services</h2>
      <p>
        The Site may link to or incorporate third-party websites and services, such as mapping,
        payment, and financing providers. Their handling of your information is governed by their own
        privacy policies, and we encourage you to review them. We are not responsible for the
        practices of third parties we do not control.
      </p>

      <h2 id="changes">Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we will revise the &ldquo;Last
        updated&rdquo; date above and, where appropriate, provide additional notice. Your continued
        use of the Services after an update takes effect constitutes acceptance of the revised policy.
      </p>

      <h2 id="contact">Contact us</h2>
      <p>
        For questions about this policy or to exercise your privacy rights, contact us at{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or {COMPANY.mainPhone}, or write to
        us at:
      </p>
      <p>
        {COMPANY.legalName}
        <br />
        Attn: Privacy
        <br />
        {COMPANY.hqAddress}
      </p>
    </PageShell>
  );
}
