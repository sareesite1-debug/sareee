import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-heading text-2xl text-ink mb-3">{title}</h2>
    <div className="font-body text-[15px] text-ink-soft leading-relaxed space-y-3">{children}</div>
  </section>
);

const PrivacyPage = () => (
  <div className="bg-ivory min-h-screen">
    <div className="container mx-auto px-6 pt-36 pb-24 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-maroon mb-8 font-body uppercase tracking-[0.25em]">
        <ArrowLeft size={13} /> Home
      </Link>
      <p className="eyebrow text-gold-dark mb-3 flex items-center gap-2"><ShieldCheck size={12} /> Your trust matters</p>
      <h1 className="text-display text-4xl md:text-5xl text-ink mb-3">Privacy Policy</h1>
      <p className="font-body text-sm text-ink-soft mb-12">
        Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
      </p>

      <Section title="1. Who we are">
        <p>
          {BRAND.name}, a Mysore-based heirloom saree boutique established in 1985, operates this website
          ({typeof window !== "undefined" ? window.location.hostname : "arpithasareecenter.com"}) and the
          associated services. When we say "we", "us" or "our", we mean {BRAND.name}.
        </p>
        <p>
          Registered address: {BRAND.address}. You can reach our privacy desk at{" "}
          <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> or call{" "}
          <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a> between
          10:00 AM and 8:00 PM IST, Monday to Saturday.
        </p>
        <p>
          This policy is published in accordance with the Information Technology Act, 2000, the
          Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal
          Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 (DPDP Act).
        </p>
      </Section>

      <Section title="2. What we collect">
        <p>We only collect what we need to serve you. Specifically:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account data</strong> — your name, email, password hash and (optionally) phone number when you create an account or sign in with Google.</li>
          <li><strong>Order data</strong> — shipping address, billing address, contact details, order history, GST number (if you provide one) and payment status. Card and UPI credentials are processed directly by our payment partners — we never see or store them.</li>
          <li><strong>Communication data</strong> — messages you send through the contact form, in-app chat, or email, plus any photos you attach for a return or exchange.</li>
          <li><strong>Browsing data</strong> — pages visited, device type, approximate location (city/region from IP), and basic interaction analytics to help us improve the site. No third-party advertising trackers.</li>
          <li><strong>Cookies & local storage</strong> — your login session, cart contents and theme preference. See Section 6.</li>
          <li><strong>Voluntary data</strong> — anything else you choose to share with us (size preferences, occasion notes for a bridal consultation, etc.).</li>
        </ul>
        <p>We do not knowingly collect data from children under 18. If you believe a child has shared data with us, email us and we will delete it.</p>
      </Section>

      <Section title="3. How we use it">
        <ul className="list-disc pl-5 space-y-2">
          <li>To fulfil your orders — process payment, pack, ship, and deliver.</li>
          <li>To send transactional emails — order confirmation, dispatch, delivery, refund, cancellation.</li>
          <li>To provide customer support and respond to your queries.</li>
          <li>To maintain your account and remember items in your bag and wishlist.</li>
          <li>To detect and prevent fraud, abuse and security incidents.</li>
          <li>To meet legal and tax obligations (GST invoicing, accounting records, lawful requests).</li>
          <li>To improve the website — diagnose bugs, measure page performance, refine product photography.</li>
        </ul>
        <p>We never sell, rent or trade your personal data. We do not use your data for behavioural advertising or profiling.</p>
      </Section>

      <Section title="4. Lawful basis (DPDP Act)">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Performance of a contract</strong> — to fulfil orders you place with us.</li>
          <li><strong>Consent</strong> — for marketing emails (you can opt out anytime) and for non-essential cookies, if any.</li>
          <li><strong>Legitimate use</strong> — security, fraud prevention, customer support, internal analytics.</li>
          <li><strong>Legal obligation</strong> — tax records, response to lawful requests from authorities.</li>
        </ul>
      </Section>

      <Section title="5. Who sees your data">
        <p>We share the minimum data necessary with carefully selected partners:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Shipping partners</strong> (Shiprocket, India Post, Delhivery, Blue Dart and similar) — name, address, phone and order weight, only to deliver your order.</li>
          <li><strong>Payment processors</strong> — when you choose online payment, your payment details go directly to them; we receive only a success/failure token.</li>
          <li><strong>Email service</strong> — to send you transactional order updates.</li>
          <li><strong>Cloud infrastructure</strong> — encrypted hosting and database providers (data centres in Asia/EU).</li>
          <li><strong>Government authorities</strong> — only when legally compelled (court order, tax notice, lawful police request).</li>
        </ul>
        <p>All partners are bound by confidentiality and data-processing agreements. Access inside our team is role-based and protected by row-level security and multi-factor authentication.</p>
      </Section>

      <Section title="6. Cookies & local storage">
        <p>We use only what is necessary for the site to function:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Session</strong> — keeps you signed in (HTTP-only, secure cookie).</li>
          <li><strong>Cart</strong> — remembers items in your bag (browser local storage).</li>
          <li><strong>Preferences</strong> — theme, recently viewed.</li>
          <li><strong>Analytics</strong> — first-party, aggregated page-view counts. No cross-site tracking.</li>
        </ul>
        <p>We do not use marketing, retargeting or advertising cookies. You can clear cookies from your browser at any time; doing so will sign you out and empty your cart.</p>
      </Section>

      <Section title="7. Your rights">
        <p>Under the DPDP Act and applicable law you have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Request a copy of the personal data we hold about you (right to access).</li>
          <li>Ask us to correct inaccurate data (right to correction).</li>
          <li>Ask us to delete your data (right to erasure), subject to legal retention obligations.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>File a grievance with our Grievance Officer (see Section 11).</li>
          <li>Nominate another person to exercise these rights on your behalf in case of incapacity.</li>
        </ul>
        <p>Email <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> from the address on your account. We respond within 7 business days and fulfil verified requests within 30 days.</p>
      </Section>

      <Section title="8. Retention">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Order & invoice records</strong> — 7 years, to comply with the Income Tax Act and GST law.</li>
          <li><strong>Account data</strong> — kept while your account is active. If you delete your account, we remove your profile within 30 days (except records we must retain for tax/legal reasons).</li>
          <li><strong>Support emails</strong> — 2 years.</li>
          <li><strong>Browsing analytics</strong> — aggregated and retained for 13 months.</li>
        </ul>
      </Section>

      <Section title="9. Security">
        <p>We implement reasonable security practices aligned with ISO/IEC 27001 principles:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>TLS 1.2+ encryption in transit; AES-256 encryption at rest.</li>
          <li>Hashed passwords (bcrypt/argon2); never stored in plain text.</li>
          <li>Row-level security on the database — your records are only readable by you and authorised staff.</li>
          <li>Regular dependency and vulnerability scans on the codebase.</li>
          <li>Principle of least privilege for internal access; activity is logged.</li>
        </ul>
        <p>No system is perfectly secure. If we ever discover a breach affecting your personal data, we will notify the Data Protection Board and impacted users without undue delay, as required by law.</p>
      </Section>

      <Section title="10. International transfers">
        <p>Your data is primarily processed and stored in India and within ISO-certified data centres in Asia/EU operated by our cloud providers. We rely on standard contractual safeguards for any cross-border transfer and only transfer data to jurisdictions that ensure adequate protection.</p>
      </Section>

      <Section title="11. Grievance Officer">
        <p>In accordance with Rule 5(9) of the IT Rules, 2011 and the DPDP Act, the Grievance Officer for {BRAND.name} is:</p>
        <ul className="list-none pl-0 space-y-1">
          <li><strong>Name:</strong> Customer Care Lead</li>
          <li><strong>Email:</strong> <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a></li>
          <li><strong>Phone:</strong> <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a></li>
          <li><strong>Address:</strong> {BRAND.address}</li>
          <li><strong>Hours:</strong> Mon – Sat, 10:00 AM – 8:00 PM IST</li>
        </ul>
        <p>We acknowledge complaints within 48 hours and resolve them within 15 days.</p>
      </Section>

      <Section title="12. Changes to this policy">
        <p>We will post any updates on this page and revise the "last updated" date at the top. Material changes will also be communicated by email if you have an account. Continued use of the site after an update constitutes acceptance of the revised policy.</p>
      </Section>
    </div>
  </div>
);

export default PrivacyPage;
