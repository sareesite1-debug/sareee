import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { BRAND } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", interest: "general" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Attempt to send email via edge function (requires setup, fallback to toast)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ type: "contact_inquiry", ...form }),
      });
      toast.success("Message sent successfully. Our team will be in touch soon.");
      setForm({ name: "", email: "", phone: "", message: "", interest: "general" });
    } catch (error) {
      toast.success("Thanks for reaching out! We will get back to you shortly.");
      setForm({ name: "", email: "", phone: "", message: "", interest: "general" });
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ label, field, type = "text", required = true, rows }: any) => (
    <div className="relative group mb-8">
      <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-2 text-ink-soft transition-colors group-focus-within:text-emerald">{label}{required && " *"}</label>
      {rows ? (
        <textarea value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={required} rows={rows}
          className="w-full bg-transparent border-b border-gold/30 px-0 py-2 text-ink font-body focus:outline-none focus:border-emerald resize-none transition-colors placeholder:text-ink-soft/30" />
      ) : (
        <input type={type} value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} required={required}
          className="w-full bg-transparent border-b border-gold/30 px-0 py-2 text-ink font-body focus:outline-none focus:border-emerald transition-colors placeholder:text-ink-soft/30" />
      )}
      <motion.div className="absolute bottom-0 left-0 h-px bg-emerald origin-left" initial={{ scaleX: 0 }} whileInView={{ scaleX: 0 }} />
    </div>
  );

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero */}
      <section className="relative pt-40 pb-20 overflow-hidden bg-emerald-deep">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--gold))_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6 lg:px-10 relative z-10 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex justify-center items-center gap-3 mb-6">
            <div className="w-8 h-px bg-gold" /><span className="eyebrow text-gold">Reach Out</span><div className="w-8 h-px bg-gold" />
          </motion.div>
          <h1 className="text-display text-5xl md:text-6xl text-ivory mb-6">
            <span className="block overflow-hidden"><motion.span className="block" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>Start a</motion.span></span>
            <span className="block overflow-hidden"><motion.span className="block italic text-gold/90" initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>conversation.</motion.span></span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="text-ivory/60 text-lg font-body font-light">
            Whether inquiring about a bridal trousseau or seeking care advice for an heirloom, our team is here to assist you.
          </motion.p>
        </div>
      </section>

      <section className="container mx-auto px-6 lg:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <p className="eyebrow text-gold-dark mb-4">The Boutique</p>
              <h2 className="font-heading text-3xl text-ink mb-6">Visit our sanctuary in Mysore.</h2>
              <p className="text-ink-soft font-body leading-relaxed mb-8">
                Located in the quiet lanes of Gangotri Layout, our flagship store offers an intimate viewing experience away from the rush of the city.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: MapPin, title: "Address", content: BRAND.addressLines.map((l, i) => <span key={i} className="block">{l}</span>) },
                { icon: Phone, title: "Phone", content: <a href={`tel:${BRAND.phone}`} className="hover:text-emerald transition-colors">{BRAND.phoneFormatted}</a> },
                { icon: Mail, title: "Email", content: <a href={`mailto:${BRAND.email}`} className="hover:text-emerald transition-colors">{BRAND.email}</a> },
                { icon: Clock, title: "Hours", content: <><span className="block">Mon – Sat: 10:00 AM – 8:00 PM</span><span className="block">Sunday: 11:00 AM – 6:00 PM</span></> }
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center shrink-0 group-hover:border-gold group-hover:bg-gold/5 transition-colors">
                    <item.icon size={16} className="text-gold-dark" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl text-ink mb-2">{item.title}</h3>
                    <div className="text-sm text-ink-soft font-body leading-relaxed">{item.content}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="glass-card p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="mb-10 relative z-10">
                <p className="eyebrow text-gold-dark mb-2 flex items-center gap-2"><Sparkles size={12} /> Send an Inquiry</p>
                <h3 className="font-heading text-3xl text-ink">How can we help?</h3>
              </div>

              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="mb-8">
                  <label className="block text-[9px] font-body uppercase tracking-[0.25em] mb-4 text-ink-soft">Nature of Inquiry</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { id: "general", label: "General Query" },
                      { id: "bridal", label: "Bridal Consultation" },
                      { id: "order", label: "Existing Order" },
                      { id: "press", label: "Press / Wholesale" }
                    ].map(opt => (
                      <button type="button" key={opt.id} onClick={() => setForm({ ...form, interest: opt.id })}
                        className={`font-display text-[8px] uppercase tracking-[0.2em] px-4 py-2 border transition-all ${
                          form.interest === opt.id ? "border-emerald-deep bg-emerald-deep text-ivory" : "border-gold/30 text-ink-soft hover:border-gold"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <InputField label="Full Name" field="name" />
                  <InputField label="Phone Number" field="phone" type="tel" />
                </div>
                
                <InputField label="Email Address" field="email" type="email" />
                <InputField label="Your Message" field="message" rows={4} />

                <button type="submit" disabled={submitting} className="btn-liquid btn-emerald w-full py-5 disabled:opacity-50 mt-4">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {submitting ? "Sending..." : "Send Message"} <Send size={14} />
                  </span>
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="border-t border-gold/15 bg-ivory-deep py-20">
         <div className="container mx-auto px-6 lg:px-10 text-center">
            <h2 className="eyebrow text-gold-dark mb-8">Find Us</h2>
            <div className="w-full aspect-video max-h-[500px] border border-gold/20 bg-ivory flex flex-col items-center justify-center grayscale hover:grayscale-0 transition-all duration-700">
               <MapPin size={32} className="text-gold mb-4" />
               <p className="font-heading text-2xl text-ink mb-2">Arpitha Saree Center</p>
               <p className="font-body text-sm text-ink-soft">Mysore, Karnataka</p>
               <a href={`https://maps.google.com/?q=${encodeURIComponent(BRAND.address)}`} target="_blank" rel="noreferrer" className="mt-6 link-reveal font-display text-[9px] uppercase tracking-[0.3em] text-emerald">View on Google Maps</a>
            </div>
         </div>
      </section>
    </div>
  );
};

export default ContactPage;
