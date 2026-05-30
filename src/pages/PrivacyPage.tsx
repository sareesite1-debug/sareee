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
      <p className="font-body text-sm text-ink-soft mb-12">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>

      <Section title="1. Who we are">
        <p>{BRAND.name}, a Mysore-based heirloom saree boutique established in 1985, operates this website and the associated services. When we say "we", "us" or "our", we mean {BRAND.name}.</p>
        <p>You can reach us at <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> or call <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a>.</p>
      </Section>

      <Section title="2. What we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Account data</strong> — your name, email and (if you choose) phone number when you create an account.</li>
          <li><strong>Order data</strong> — shipping address, contact details, order history and payment status. Payments themselves are processed by our payment partners; we never store your card or UPI credentials.</li>
          <li><strong>Browsing data</strong> — basic analytics (pages visited, device type) to help us improve the site. No third-party advertising trackers.</li>
          <li><strong>Communication</strong> — messages you send us through the contact form or in-app chat.</li>
        </ul>
      </Section>

      <Section title="3. How we use it">
        <ul className="list-disc pl-5 space-y-2">
          <li>To fulfil your orders, send tracking updates, and provide customer support.</li>
          <li>To send transactional emails (order confirmation, dispatch, delivery, cancellation).</li>
          <li>To maintain your account and remember items in your bag.</li>
          <li>To meet legal and tax obligations (GST invoicing, accounting records).</li>
        </ul>
        <p>We never sell, rent or trade your personal data. We do not use your data for behavioural advertising.</p>
      </Section>

      <Section title="4. Who sees your data">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Shipping partners</strong> — to deliver your order (name, address, phone only).</li>
          <li><strong>Payment processors</strong> — when you choose online payment, your payment details go directly to them.</li>
          <li><strong>Email service</strong> — to send you order updates.</li>
        </ul>
        <p>All data is stored on secure, encrypted servers. Access is restricted to authorised staff only and protected by row-level security.</p>
      </Section>

      <Section title="5. Cookies">
        <p>We use only the cookies needed for the site to function (login session, cart contents). We do not use marketing or tracking cookies.</p>
      </Section>

      <Section title="6. Your rights">
        <p>You can at any time:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Request a copy of the personal data we hold about you.</li>
          <li>Ask us to correct or delete your data.</li>
          <li>Close your account.</li>
        </ul>
        <p>Just email <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> from the address on your account.</p>
      </Section>

      <Section title="7. Retention">
        <p>Order records are retained for 7 years to comply with Indian tax law. Account data is kept while your account is active; if you delete it, we remove your profile within 30 days (except where law requires us to keep records).</p>
      </Section>

      <Section title="8. Changes">
        <p>We will post any updates on this page and revise the "last updated" date. Significant changes will also be communicated by email if you have an account.</p>
      </Section>
    </div>
  </div>
);

export default PrivacyPage;
