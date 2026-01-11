"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    fetch("/faq.json")
      .then((res) => res.json())
      .then(setFaqs);
  }, []);

  return (
    <section id="faq" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-teal-400 text-left md:text-center">Start with a Diagnostic</h2>
        <p className="text-lg md:text-2xl font-body mb-6 text-teal-100 text-left md:text-center">If you're dealing with coordination drag or operational friction slowing your organization down, we should talk.</p>
      </div>
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
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
        <div className="flex justify-center mt-10">
          <Link
            href="#contact"
            className="px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Request a Diagnostic
          </Link>
        </div>
      </div>
    </section>
  );
} 