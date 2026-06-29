import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly to us when you create an account, place an order, or contact us for support. This includes your name, email address, shipping address, phone number, and payment information.",
  },
  {
    title: "How We Use Your Information",
    body: "We use the information we collect to process your orders, send order confirmations and shipping updates, respond to your questions, and improve our services. We do not sell your personal information to third parties.",
  },
  {
    title: "Order & Payment Data",
    body: "Payment card details are processed securely via Stripe and are never stored on our servers. We retain order history to provide you with account access and support for returns or disputes.",
  },
  {
    title: "Cookies",
    body: "We use cookies to maintain your shopping cart session and remember your preferences. You can disable cookies in your browser settings, though some features of the site may not function correctly without them.",
  },
  {
    title: "Data Security",
    body: "We implement industry-standard security measures to protect your personal information. All data transmitted between your browser and our servers is encrypted using SSL/TLS.",
  },
  {
    title: "Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data at any time by contacting us at support@luxxedit.com. We will respond to all valid requests within 30 days.",
  },
  {
    title: "Contact",
    body: "For any privacy-related questions or concerns, please reach out to us at support@luxxedit.com.",
  },
];

export default function PrivacyPage() {
  return (
    <main>
      <Header />
      <section className="bg-white pt-32 pb-20 px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Legal</p>
          <h1 className="mb-3 font-fraunces text-5xl font-light leading-none tracking-[-0.045em] md:text-6xl">
            Privacy <em className="italic">Policy.</em>
          </h1>
          <p className="mb-14 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40">
            Last updated: June 2026
          </p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <div key={section.title} className="border-t border-black/10 pt-8">
                <div className="flex items-start gap-6">
                  <span className="font-jet text-[10px] text-black/25 mt-1 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="mb-3 font-fraunces text-xl font-light tracking-[-0.02em]">
                      {section.title}
                    </h2>
                    <p className="text-[14px] leading-[1.85] text-black/60">{section.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
