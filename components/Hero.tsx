"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroContent {
  heading: string;
  subheading: string;
  cta: { label: string; href: string };
  announcement: { label: string; href: string };
  metric?: { value: string; label: string };
  clientLogos: { src: string; alt: string }[];
}

export default function Hero() {
  const [content, setContent] = useState<HeroContent | null>(null);

  useEffect(() => {
    fetch("/hero.json")
      .then((res) => res.json())
      .then(setContent);
  }, []);

  if (!content) return null;

  return (
    <section className="page-hero text-white" style={{ backgroundColor: '#0a2236', backgroundImage: 'url(/circuit-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      {/* Top inside shadow */}
      <div className="absolute top-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 16px 32px -8px #0008'}} />
      {/* Bottom inside shadow */}
      <div className="absolute bottom-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 -16px 32px -8px #0008'}} />
      {/* Framer Motion animated background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        />
      </motion.div>
      <div className="page-hero-content relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center px-4">
        {/* Announcement */}
        <Link
          href={content.announcement.href}
          className="inline-block mb-4 px-4 py-1 rounded-full bg-teal-500/80 text-gray-900 font-semibold text-sm hover:bg-orange-500 hover:text-white transition-colors"
        >
          {content.announcement.label}
        </Link>
        {/* Heading */}
        <h1 className="page-hero-heading">
          {content.heading}
        </h1>
        {/* Subheading */}
        <p className="page-hero-subheading font-body mb-8">
          {content.subheading}
        </p>
        {/* CTA */}
        <Link
          href={content.cta.href}
          className="px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg shadow hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {content.cta.label}
        </Link>
        {/* Optional metric */}
        {content.metric && (
          <div className="mt-8 px-6 py-4 rounded-lg bg-white/10 border border-white/20">
            <span className="text-3xl md:text-4xl font-heading font-bold text-teal-400">{content.metric.value}</span>
            <p className="text-sm text-white/80 mt-1">{content.metric.label}</p>
          </div>
        )}
      </div>
    </section>
  );
} 