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
      <p className="font-body text-sm text-ink-soft mb-12">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long" })}</p>

      <Section title="1. Cancellation before dispatch">
        <p>You can cancel any order at no cost before it is marked as <em>Shipped</em>. Go to <Link to="/orders" className="text-maroon underline">My Orders</Link>, open the order, and tap <em>Cancel Order</em>. Refunds for online payments are issued to the original payment method within 5–7 business days.</p>
        <p className="text-rose">Once an order is shipped, it cannot be cancelled — please see the return process below.</p>
      </Section>

      <Section title="2. 7-day exchange window">
        <p>We accept exchanges on unworn, unwashed pieces within <strong>7 days</strong> of delivery. The original tags must be intact and the saree must be in its original fold.</p>
      </Section>

      <Section title="3. What is eligible">
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="border border-emerald/20 bg-emerald/5 p-4 rounded">
            <p className="flex items-center gap-2 font-heading text-emerald-deep mb-2"><Check size={14} /> We accept</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Defective or damaged on arrival</li>
              <li>Wrong item shipped</li>
              <li>Significant colour mismatch with photo</li>
              <li>Unworn pieces within 7 days</li>
            </ul>
          </div>
          <div className="border border-rose/20 bg-rose/5 p-4 rounded">
            <p className="flex items-center gap-2 font-heading text-rose mb-2"><XIcon size={14} /> We can't accept</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Worn, washed, or altered sarees</li>
              <li>Items without original tags</li>
              <li>Custom-blouse or stitched orders</li>
              <li>Items returned after 7 days of delivery</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="4. How to start a return">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Email <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a> within 7 days of delivery with your order number and a few photos of the issue.</li>
          <li>Our team replies within 1 business day with a return shipping label or pickup arrangement.</li>
          <li>Pack the saree in its original wrapping. Drop it at the courier or hand it to the pickup agent.</li>
          <li>We inspect the item within 2 business days of receipt.</li>
        </ol>
      </Section>

      <Section title="5. Refunds">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Online payment</strong> — refunded to the source account in 5–7 business days after we receive and inspect the return.</li>
          <li><strong>Cash on Delivery</strong> — refunded by bank transfer; we will request the account details by email.</li>
          <li>Original shipping (if charged) is non-refundable unless the return is due to our error.</li>
        </ul>
      </Section>

      <Section title="6. Exchanges">
        <p>If you'd prefer to exchange for a different size, colour or design, we'll waive the return shipping when the replacement value is equal or higher. Differences are settled by additional payment or refund.</p>
      </Section>

      <Section title="7. Damaged in transit">
        <p>If your parcel arrives damaged, please photograph the package <em>before</em> opening it and email us within 48 hours. We'll replace the item at no cost.</p>
      </Section>

      <Section title="8. Need help?">
        <p>We're a small family team and we read every message. Call <a href={`tel:${BRAND.phone}`} className="text-maroon">{BRAND.phoneFormatted}</a> (10 AM – 8 PM IST) or email <a href={`mailto:${BRAND.email}`} className="text-maroon underline">{BRAND.email}</a>.</p>
      </Section>
    </div>
  </div>
);

export default ReturnsPage;
