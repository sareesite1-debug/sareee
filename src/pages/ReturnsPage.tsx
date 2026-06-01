import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Check, X as XIcon } from "lucide-react";
import { BRAND } from "@/lib/brand";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="font-heading text-2xl text-ink mb-3">{title}</h2>
    <div className="font-body text-[15px] text-ink-soft leading-relaxed space-y-3">{children}</div>
  </section>
);

const ReturnsPage = () => (
  <div className="bg-ivory min-h-screen">
    <div className="container mx-auto px-6 pt-36 pb-24 max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-[10px] text-ink-soft hover:text-maroon mb-8 font-body uppercase tracking-[0.25em]">
        <ArrowLeft size={13} /> Home
      </Link>
      <p className="eyebrow text-gold-dark mb-3 flex items-center gap-2"><RotateCcw size={12} /> Easy and honest</p>
      <h1 className="text-display text-4xl md:text-5xl text-ink mb-3">Returns & Exchanges</h1>
      <p className="font-body text-sm text-ink-soft mb-12">
        Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
      </p>

      <Section title="At a glance">
        <ul className="list-disc pl-5 space-y-2">
          <li>Cancel free anytime before dispatch.</li>
          <li>7-day exchange window from delivery, on unworn pieces with original tags.</li>
          <li>Defects, damage in transit, or wrong item shipped — fully covered, no questions.</li>
          <li>Refunds in 5–7 business days after inspection.</li>
          <li>Custom-stitched and fall-pico orders are non-returnable (unless defective).</li>
        </ul>
      </Section>

      <Section title="1. Cancellation before dispatch">
        <p>
          You can cancel any order at no cost before it is marked as <em>Shipped</em>. Go to{" "}
          <Link to="/orders" className="text-maroon underline">My Orders</Link>, open the order, and tap
          <em> Cancel Order</em>. Refunds for online payments are issued to the original payment method within
          5–7 business days. COD orders need no further action.
        </p>
        <p className="text-rose">
          Once an order is shipped, cancellation is locked at the database level for both customer and admin —
          please use the return process below instead.
        </p>
      </Section>

      <Section title="2. 7-day exchange window">
        <p>We accept exchanges on unworn, unwashed pieces within <strong>7 days</strong> of delivery. The original tags must be intact, the saree must be in its original fold, and the original invoice must accompany the return.</p>
      </Section>

      <Section title="3. What is eligible">
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="border border-emerald/20 bg-emerald/5 p-4 rounded">
            <p className="flex items-center gap-2 font-heading text-emerald-deep mb-2"><Check size={14} /> We accept</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Defective on arrival (loose threads, holes, broken zari)</li>
              <li>Damaged in transit (packaging compromised)</li>
              <li>Wrong item or wrong colour shipped</li>
              <li>Significant colour mismatch with the website photo</li>
              <li>Unworn pieces within 7 days, tags intact</li>
            </ul>
          </div>
          <div className="border border-rose/20 bg-rose/5 p-4 rounded">
            <p className="flex items-center gap-2 font-heading text-rose mb-2"><XIcon size={14} /> We can't accept</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Worn, washed, ironed or altered sarees</li>
              <li>Items without original tags or invoice</li>
              <li>Custom blouse, fall-pico or stitched orders</li>
              <li>Items returned after 7 days of delivery</li>
              <li>Sale items marked "final sale"</li>
              <li>Items damaged due to misuse after delivery</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="4. How to start a return">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Email <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> within 7 days of delivery with your order number, a short note about the issue, and 2–3 clear photos.</li>
          <li>Our team replies within 1 business day with a return shipping label or pickup arrangement (where pincode is serviceable).</li>
          <li>Pack the saree in its original wrapping with the invoice slip. Drop it at the courier hub or hand it to the pickup agent — please don't seal until the agent has inspected the parcel.</li>
          <li>We inspect the item within 2 business days of receipt and email you the outcome.</li>
          <li>Refund or exchange is processed immediately after inspection.</li>
        </ol>
      </Section>

      <Section title="5. Refunds">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Online payment</strong> — refunded to the source account in 5–7 business days after we receive and inspect the return. Bank-side credit may take an extra 2–3 days.</li>
          <li><strong>Cash on Delivery</strong> — refunded by NEFT/IMPS bank transfer; we request the account details by email and credit within 3 business days of receiving them.</li>
          <li><strong>Original shipping fee</strong> — non-refundable unless the return is due to our error.</li>
          <li><strong>Return shipping</strong> — free if the issue is our fault (defect, damage, wrong item). Otherwise a flat ₹150 reverse-pickup fee is deducted from the refund.</li>
          <li><strong>Partial returns</strong> — refund is calculated on the line-item price after distributing any order-level discount proportionally.</li>
        </ul>
      </Section>

      <Section title="6. Exchanges">
        <p>If you'd prefer to exchange for a different size, colour or design, we'll waive the reverse-pickup fee when the replacement value is equal or higher. Differences are settled by additional payment (for a higher-value exchange) or refund (for a lower-value exchange). Exchanges are subject to stock availability — if the replacement is out of stock, we issue a full refund.</p>
      </Section>

      <Section title="7. Damaged in transit">
        <p>If your parcel arrives damaged or tampered with, please <strong>photograph the package before opening it</strong> and email us within 48 hours along with the unboxing photos. We'll dispatch a replacement at no cost and arrange a reverse pickup of the damaged item.</p>
      </Section>

      <Section title="8. Auto-restock & stock visibility">
        <p>When an order is cancelled or returned, the stock is automatically added back to the catalogue and the product becomes visible to other customers again. This keeps inventory accurate for everyone.</p>
      </Section>

      <Section title="9. Non-returnable items">
        <ul className="list-disc pl-5 space-y-2">
          <li>Sarees with custom blouse stitching or fall-pico done at your request.</li>
          <li>Items personalised with custom embroidery or name tags.</li>
          <li>Gift cards and digital vouchers.</li>
          <li>Items explicitly marked "Final Sale" on the product page.</li>
        </ul>
      </Section>

      <Section title="10. Need help?">
        <p>
          We're a small family team and we read every message.<br />
          📞 <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a> (Mon–Sat, 10 AM – 8 PM IST)<br />
          ✉️ <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a><br />
          📍 {BRAND.address}
        </p>
      </Section>
    </div>
  </div>
);

export default ReturnsPage;
