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
      <p className="font-body text-sm text-ink-soft mb-12">
        Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
      </p>

      <Section title="1. Agreement">
        <p>
          These Terms govern your access to and use of the {BRAND.name} website, mobile experience, and
          related services (collectively, the "Service"). By browsing the site, creating an account, or
          placing an order, you agree to these Terms and to our{" "}
          <Link to="/privacy" className="text-maroon underline">Privacy Policy</Link> and{" "}
          <Link to="/returns" className="text-maroon underline">Returns Policy</Link>.
          If you do not agree, please do not use the Service.
        </p>
        <p>You must be at least 18 years old (or have the consent of a parent or guardian) to place an order.</p>
      </Section>

      <Section title="2. Eligibility & account">
        <ul className="list-disc pl-5 space-y-2">
          <li>You agree to provide accurate, current and complete information when creating an account or placing an order.</li>
          <li>You are responsible for keeping your password confidential and for all activity under your account.</li>
          <li>Notify us immediately at <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> if you suspect unauthorised access.</li>
          <li>We may suspend or terminate accounts that engage in fraud, abuse, or violate these Terms.</li>
        </ul>
      </Section>

      <Section title="3. Products & pricing">
        <ul className="list-disc pl-5 space-y-2">
          <li>All sarees are handwoven; small variations in colour, weave, weight, zari pattern and length are part of the craft and are not defects.</li>
          <li>Product photographs are taken in natural light and as accurate as possible. Actual colour may vary slightly with your screen calibration.</li>
          <li>All prices are in Indian Rupees (₹) and <strong>inclusive of GST at 5%</strong> as applicable. For Karnataka deliveries this is split as 2.5% CGST + 2.5% SGST; for other states it appears as 5% IGST on your invoice.</li>
          <li>We reserve the right to correct typographical, pricing or stock errors before dispatch. If a correction affects your order, we will contact you and you may cancel for a full refund.</li>
          <li>Promotional offers, coupons and free-shipping thresholds are valid only as stated; one offer per order unless explicitly stacked.</li>
        </ul>
      </Section>

      <Section title="4. Orders & acceptance">
        <ul className="list-disc pl-5 space-y-2">
          <li>Adding items to your bag is an invitation to offer; an order becomes a contract only after we confirm it by email.</li>
          <li>An order is confirmed once payment is received (online) or our team verifies the address (Cash on Delivery).</li>
          <li>Once placed, orders are auto-confirmed and forwarded for packing. You can cancel any time before the order is marked as <em>Shipped</em>.</li>
          <li>We may decline an order at our discretion — suspected fraud, undeliverable address, out-of-stock item, or pricing error.</li>
          <li>After shipping, cancellation is locked at the database level for both customer and admin. Please see the <Link to="/returns" className="text-maroon underline">Returns Policy</Link>.</li>
        </ul>
      </Section>

      <Section title="5. Payment">
        <ul className="list-disc pl-5 space-y-2">
          <li>We accept UPI, bank transfer, major debit and credit cards, and Cash on Delivery (where serviceable).</li>
          <li>For COD, please keep exact change ready; the courier may refuse to make change for large notes.</li>
          <li>Payment-gateway data is handled directly by the payment provider; we never see or store your card or UPI credentials.</li>
          <li>If a payment is captured but the order fails to confirm, the amount is auto-refunded within 5–7 business days.</li>
        </ul>
      </Section>

      <Section title="6. Shipping & delivery">
        <ul className="list-disc pl-5 space-y-2">
          <li>Pan-India shipping is complimentary above ₹5,000; below that a flat shipping fee is shown at checkout.</li>
          <li>Typical dispatch is 1–3 business days; delivery 3–7 business days depending on pincode.</li>
          <li>You will receive tracking details by email once your order is shipped.</li>
          <li>Risk of loss passes to you once the courier marks the order as delivered. If a parcel arrives damaged, photograph it before opening and contact us within 48 hours.</li>
          <li>We currently ship within India only. For international enquiries please write to <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a>.</li>
        </ul>
      </Section>

      <Section title="7. Returns, exchanges & cancellations">
        <p>
          Please read the full <Link to="/returns" className="text-maroon underline">Returns & Exchanges Policy</Link>.
          In summary: cancel free before dispatch; 7-day exchange on unworn pieces with intact tags;
          refunds to the original payment method within 5–7 business days of inspection.
        </p>
      </Section>

      <Section title="8. User content">
        <ul className="list-disc pl-5 space-y-2">
          <li>If you post a review, photo or message, you grant us a non-exclusive, royalty-free licence to display it on the site and our social channels in connection with the relevant product.</li>
          <li>You confirm that you own the rights to any content you submit and that it does not infringe third-party rights or violate any law.</li>
          <li>We may remove content that is unlawful, abusive, misleading or off-topic without prior notice.</li>
        </ul>
      </Section>

      <Section title="9. Prohibited use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use the Service for any unlawful purpose or in breach of these Terms.</li>
          <li>Attempt to gain unauthorised access to any part of the Service, other accounts, or our infrastructure.</li>
          <li>Scrape, mirror or republish content without written permission.</li>
          <li>Introduce malware, viruses or any other harmful code.</li>
          <li>Place fraudulent or speculative orders, or use stolen payment instruments.</li>
        </ul>
      </Section>

      <Section title="10. Intellectual property">
        <p>All images, text, designs, weave patterns and the {BRAND.name} brand are our property or used under licence. You may not reproduce, distribute or create derivative works without prior written permission. The "Arpitha Saree Center" name and logo are trademarks of {BRAND.name}.</p>
      </Section>

      <Section title="11. Third-party links">
        <p>The Service may contain links to third-party websites (payment gateways, courier tracking, social media). We are not responsible for the content, policies or practices of those sites; review their terms before use.</p>
      </Section>

      <Section title="12. Disclaimers">
        <p>The Service is provided on an "as is" and "as available" basis. To the maximum extent permitted by law, we make no warranties — express or implied — regarding uninterrupted access, accuracy of content, or fitness for a particular purpose. Colour and texture of handwoven products may vary marginally from photographs.</p>
      </Section>

      <Section title="13. Limitation of liability">
        <p>To the extent permitted by law, our total liability for any claim arising out of or in connection with an order is limited to the amount you actually paid us for that order. We are not liable for indirect, incidental, consequential, special or punitive damages, or for loss of profit, goodwill or data.</p>
        <p>Nothing in these Terms excludes liability that cannot be excluded under applicable consumer-protection law.</p>
      </Section>

      <Section title="14. Indemnity">
        <p>You agree to indemnify and hold harmless {BRAND.name}, its directors, employees and partners from any claim or demand arising from your breach of these Terms or your misuse of the Service.</p>
      </Section>

      <Section title="15. Force majeure">
        <p>We are not liable for delays or failures caused by events outside our reasonable control — natural disasters, strikes, courier disruption, government action, internet outages, or pandemics.</p>
      </Section>

      <Section title="16. Governing law & jurisdiction">
        <p>These Terms are governed by the laws of India. Subject to applicable consumer-protection law, any dispute is subject to the exclusive jurisdiction of the courts of Mysore, Karnataka. Before approaching a court, please contact our Grievance Officer (see the <Link to="/privacy" className="text-maroon underline">Privacy Policy</Link>) so we can try to resolve the matter amicably.</p>
      </Section>

      <Section title="17. Changes to these Terms">
        <p>We may update these Terms from time to time. Updates take effect when posted on this page, with a revised "last updated" date. Continued use of the Service after an update constitutes acceptance of the revised Terms.</p>
      </Section>

      <Section title="18. Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> or call{" "}
          <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a>.
          Postal address: {BRAND.address}.
        </p>
      </Section>
    </div>
  </div>
);

export default TermsPage;
