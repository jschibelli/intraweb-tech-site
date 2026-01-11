"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

interface SynaplyAIContent {
  heading: string;
  description: string;
  features: string[];
  ctas: { label: string; href: string }[];
}

export default function SynaplyAI() {
  const [content, setContent] = useState<SynaplyAIContent | null>(null);

  useEffect(() => {
    fetch("/synaplyai.json")
      .then((res) => res.json())
      .then(setContent);
  }, []);

  if (!content) return null;

  return (
    <section id="synaplyai" className="relative py-16 md:py-24 bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none">
        <svg width="100%" height="100%" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="80" fill="white" />
          <circle cx="300" cy="100" r="60" fill="white" />
        </svg>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{content.heading}</h2>
        <p className="text-lg font-body mb-8 text-white/90">{content.description}</p>
        <ul className="mb-8 space-y-3 text-left max-w-xl mx-auto">
          {content.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-white">
              <span className="w-2 h-2 rounded-full bg-yellow-300 inline-block" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {content.ctas.map((cta, i) => (
            <Link
              key={i}
              href={cta.href}
              className={`px-8 py-3 rounded font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 ${i === 0
                ? 'bg-yellow-300 text-gray-900 hover:bg-white'
                : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
                }`}
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 