"use client";

import { useState } from "react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  const inputClass =
    "h-11 w-full border border-black/20 bg-transparent px-3 font-sans text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black";

  return (
    <main>
      <Header />
      <section className="bg-white pt-32 pb-20 px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Get In Touch</p>
          <h1 className="mb-10 font-fraunces text-5xl font-light leading-none tracking-[-0.045em] md:text-6xl">
            Contact <em className="italic">Us.</em>
          </h1>

          <div className="mb-12 grid gap-6 sm:grid-cols-3">
            {[
              { label: "Email", value: "support@luxxedit.com" },
              { label: "Hours", value: "Mon–Fri, 9am–6pm" },
              { label: "Response", value: "Within 24 hours" },
            ].map((item) => (
              <div key={item.label} className="border-t border-black/10 pt-5">
                <p className="font-jet text-[9px] uppercase tracking-[0.3em] text-black/40 mb-1">{item.label}</p>
                <p className="text-sm text-black/70">{item.value}</p>
              </div>
            ))}
          </div>

          {sent ? (
            <div className="border border-green-300 bg-green-50 px-6 py-5">
              <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-green-700">
                Message sent — we&apos;ll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="How can we help?"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Your message…"
                  rows={5}
                  className="w-full border border-black/20 bg-transparent px-3 py-2.5 font-sans text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                className="mt-2 h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 sm:w-auto sm:px-10"
              >
                Send Message <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} />
              </Button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
