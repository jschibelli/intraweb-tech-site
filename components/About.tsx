"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface AboutContent {
  heading: string;
  description: string;
  ctas: { label: string; href: string }[];
}

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    fetch("/about.json")
      .then((res) => res.json())
      .then(setContent);
  }, []);

  if (!content) return null;

  return (
    <section id="about" className="relative bg-[#0a2236] py-16 md:py-24 overflow-hidden" style={{ backgroundImage: 'url(/hexagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      {/* Top inside shadow */}
      <div className="absolute top-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{ boxShadow: 'inset 0 16px 32px -8px #0008' }} />
      {/* Bottom inside shadow */}
      <div className="absolute bottom-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{ boxShadow: 'inset 0 -16px 32px -8px #0008' }} />
      {/* SVG Wave Top */}
      <div className="absolute top-0 left-0 w-full -z-10" aria-hidden="true">
        <svg viewBox="0 0 1440 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-32 md:h-40">
          <defs>
            <linearGradient id="aboutWave" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <path fill="url(#aboutWave)" d="M0,80 C360,200 1080,0 1440,120 L1440,0 L0,0 Z" />
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-4">
        {/* Two-column layout: Image on left, content on right */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Left: Profile Image & Title */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-lg overflow-hidden mb-4">
              <Image
                src="/joe-schibelli.jpg"
                alt="Joe Schibelli"
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="text-white font-bold text-lg leading-tight mb-1">John Schibelli</p>
            <p className="text-teal-400 font-medium text-sm md:text-base">Founder & Principal at IntraWeb Technologies</p>
          </div>

          {/* Right: Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl text-teal-400 md:text-4xl font-heading font-bold mb-6">{content.heading}</h2>
            <div className="text-gray-300 font-body mb-8 space-y-4">
              {content.description.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {content.ctas.map((cta, i) => (
                <a
                  key={i}
                  href={cta.href}
                  className="px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  {cta.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 