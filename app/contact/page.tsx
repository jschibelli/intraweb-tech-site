"use client";
import ContactForm from "@/components/shared/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundImage: 'url(/circuit-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Get in Touch</h1>
          <p className="text-xl md:text-2xl text-teal-400 font-semibold mb-4">Let&apos;s discuss your project</p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Have a question or want to work together? We&apos;d love to hear from you. Fill out the form below or use our contact information.
          </p>
        </div>
      </section>

      {/* Contact Section */}
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
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:info@intrawebtech.com" className="text-gray-300 hover:text-teal-400 transition-colors">
                      info@intrawebtech.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-teal-400 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+18622079004" className="text-gray-300 hover:text-teal-400 transition-colors">
                      (862) 207-9004
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-teal-400 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Location</h3>
                    <p className="text-gray-300">
                      Towaco, New Jersey
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-heading font-bold mb-8">Send us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 