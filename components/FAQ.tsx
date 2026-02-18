"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import faqData from "@/public/faq.json";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = faqData as FAQItem[];
  const teaserFaqs = faqs.slice(0, 3);

  return (
    <section id="faq" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-teal-400 text-left md:text-center">Frequently Asked Questions</h2>
        <p className="text-lg md:text-2xl font-body mb-6 text-teal-100 text-left md:text-center">Find answers to common questions about our services, process, and more.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          {teaserFaqs.map((faq, i) => (
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
                className={`grid overflow-hidden transition-all duration-300 ${open === i ? "grid-rows-[1fr] mt-4" : "grid-rows-[0fr]"}`}
                aria-hidden={open !== i}
              >
                <div className="overflow-hidden">
                  <p className="text-gray-300 font-body">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/faq"
            className="px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            View all FAQs
          </Link>
        </div>
      </div>
    </section>
  );
} 