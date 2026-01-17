"use client";
import ContactForm from "@/components/shared/contact-form";

export default function ContactPage() {
  return (
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Background Pattern */}
      <div className="relative py-16 md:py-24" style={{ backgroundImage: 'url(/circuit-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
        </div>

        {/* Contact Form */}
        <div className="relative max-w-2xl mx-auto px-4">
          <ContactForm />
        </div>
      </div>
    </main>
  );
} 