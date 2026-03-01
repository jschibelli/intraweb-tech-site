"use client";
import ContactForm from "@/components/shared/contact-form";
import { Mail, MapPin } from "lucide-react";
import EntranceReveal from "@/components/ui/EntranceReveal";

export default function ContactPage() {
  return (
    <main className="bg-gray-900 text-white">
      {/* Hero Section */}
      <EntranceReveal>
        <section className="page-hero" style={{ backgroundImage: 'url(/circuit-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
          </div>
          <div className="page-hero-content max-w-5xl mx-auto px-4 text-left sm:text-center">
            <h1 className="page-hero-heading">Ready to transform your business?</h1>
            <p className="page-hero-subheading font-body mb-4">Request a diagnostic</p>
            <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto sm:text-center">
              Request a diagnostic to bridge the gap between strategy and execution. We provide the specialized engineering firepower and architectural guidance you need to turn AI concepts into high-impact production systems.
            </p>
          </div>
        </section>
      </EntranceReveal>

      {/* Contact Section */}
      <EntranceReveal>
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-heading font-bold mb-8">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-teal-400 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Prefer email?</h3>
                      <a href="mailto:human@intrawebtech.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                        human@intrawebtech.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-teal-400 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-gray-300">Based in New Jersey</p>
                      <p className="text-gray-300 text-sm">Working with companies nationally</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <h3 className="font-semibold mb-3 text-teal-400">What you get</h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>A clear diagnostic on where your AI strategy is stuck and the highest-impact next step</li>
                    <li>Direct access to senior AI and automation engineers—no lengthy hiring or RFP cycles</li>
                    <li>Implementation tailored to your stack and workflows, not a one-size-fits-all playbook</li>
                  </ul>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-heading font-bold mb-8">Request a Diagnostic</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </EntranceReveal>
    </main>
  );
}
