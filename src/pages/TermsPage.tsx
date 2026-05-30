import { Link } from "react-router-dom";
import { ArrowLeft, ScrollText } from "lucide-react";
import { BRAND } from "@/lib/brand";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-heading text-2xl text-ink mb-3">{title}</h2>
    <div className="font-body text-[15px] text-ink-soft leading-relaxed space-y-3">{children}</div>
  </section>
);

const TermsPage = () => (
  <div className="bg-ivory min-h-screen">
    <div className="container mx-auto px-6 pt-36 pb-24 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-maroon mb-8 font-body uppercase tracking-[0.25em]">
        <ArrowLeft size={13} /> Home
      </Link>
      <p className="eyebrow text-gold-dark mb-3 flex items-center gap-2"><ScrollText size={12} /> The fine print</p>
      <h1 className="text-display text-4xl md:text-5xl text-ink mb-3">Terms & Conditions</h1>
      <p className="font-body text-sm text-ink-soft mb-12">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>

      <Section title="1. Agreement">
        <p>By using this website or placing an order with {BRAND.name}, you agree to these Terms. If you do not agree, please do not use the site.</p>
      </Section>

      <Section title="2. Products & pricing">
        <ul className="list-disc pl-5 space-y-2">
          <li>All sarees are handwoven; small variations in colour, weave and weight are part of the craft, not defects.</li>
          <li>Product photographs are taken in natural light and as accurate as possible. Actual colour may vary slightly with your screen.</li>
          <li>All prices are in Indian Rupees and <strong>inclusive of GST (5%)</strong> as required under Indian tax law.</li>
          <li>We reserve the right to correct pricing errors before dispatch. If corrected, you may cancel for a full refund.</li>
        </ul>
      </Section>

      <Section title="3. Orders">
        <ul className="list-disc pl-5 space-y-2">
          <li>An order is confirmed only after payment is received (online) or our team verifies the address (Cash on Delivery).</li>
          <li>We may decline an order at our discretion (suspected fraud, undeliverable address, out-of-stock item).</li>
          <li>You can cancel an order any time before it is marked as <em>Shipped</em>. After shipping, see the Returns policy.</li>
        </ul>
      </Section>

      <Section title="4. Payment">
        <ul className="list-disc pl-5 space-y-2">
          <li>We accept UPI, bank transfer, major cards, and Cash on Delivery (where serviceable).</li>
          <li>For COD, please keep exact change ready.</li>
          <li>Payment-gateway data is handled directly by the payment provider; we never see or store your card or UPI credentials.</li>
        </ul>
      </Section>

      <Section title="5. Shipping">
        <ul className="list-disc pl-5 space-y-2">
          <li>Pan-India shipping is complimentary above ₹5,000.</li>
          <li>Typical dispatch is 1–3 business days; delivery 3–7 business days depending on location.</li>
          <li>You will receive tracking details by email once your order is shipped.</li>
          <li>Risk of loss passes to you once the courier marks the order as delivered.</li>
        </ul>
      </Section>

      <Section title="6. Intellectual property">
        <p>All images, text, designs and the {BRAND.name} brand are our property or used under licence. You may not reproduce them without written permission.</p>
      </Section>

      <Section title="7. Liability">
        <p>To the extent permitted by law, our liability for any claim relating to an order is limited to the amount you paid for that order.</p>
      </Section>

      <Section title="8. Governing law">
        <p>These Terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts of Mysore, Karnataka.</p>
      </Section>

      <Section title="9. Contact">
        <p>Questions? Email <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> or call <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a>.</p>
      </Section>
    </div>
  </div>
);

export default TermsPage;
