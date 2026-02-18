"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import EntranceReveal from "@/components/ui/EntranceReveal";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch("/faq.json")
      .then((res) => res.json())
      .then(setFaqs)
      .catch(() => {
        // fallback placeholder
        setFaqs([
          { question: "What services do you offer?", answer: "We offer web app development, UI/UX design, cloud & DevOps, and AI solutions." },
          { question: "How do I get started?", answer: "Contact us through our form or schedule a free consultation call." },
          { question: "What is your process?", answer: "We follow a proven process: discovery, design, development, launch, and support." },
        ]);
      });
  }, []);

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <EntranceReveal>
        <section className="page-hero bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 text-white text-center">
          <div className="page-hero-content max-w-3xl mx-auto px-4">
            <h1 className="page-hero-heading">Frequently Asked Questions</h1>
            <p className="page-hero-subheading font-body mb-6">Find answers to common questions about our services, process, and more.</p>
          </div>
        </section>
      </EntranceReveal>
      {/* FAQ Accordion */}
      <EntranceReveal>
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid gap-8">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
                  <button
                    className="flex items-center justify-between w-full text-left text-lg font-semibold text-teal-400 focus:outline-none"
                    onClick={() => setOpen(open === i ? null : i)}
                    aria-expanded={open === i}
                    aria-controls={`faq-answer-${i}`}
                  >
                    {faq.question}
                    <ChevronDown className={`ml-2 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    id={`faq-answer-${i}`}
                    className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-40 mt-4' : 'max-h-0'}`}
                    aria-hidden={open !== i}
                  >
                    <p className="text-gray-300 font-body">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <Link
                href="/contact"
                className="px-8 py-3 rounded bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Still have questions? Contact us
              </Link>
            </div>
          </div>
        </section>
      </EntranceReveal>
    </main>
  );
} 