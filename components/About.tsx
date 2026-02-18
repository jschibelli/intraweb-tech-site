"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface AboutContent {
  heading: string;
  tagline: string;
  description: string;
  bullets: string[];
  ctas: { label: string; href: string }[];
}

const team = [
  {
    name: "John Schibelli",
    title: "Founder & COO",
    image: "/john_shibelli.png",
    bio: "John provides strategic vision, product direction, and final approvals for all projects. He is passionate about building innovative solutions that drive business growth.",
  },
  {
    name: "Chris Weston",
    title: "Senior Software Engineer",
    image: "/ctw_bio_photo.png",
    bio: "Chris architects scalable systems, drives full-stack development, and brings deep engineering expertise to every project.",
  },
];

export default function About() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const toggleBio = (name: string) => {
    setExpandedName((prev) => (prev === name ? null : name));
  };

  useEffect(() => {
    fetch("/about.json")
      .then((res) => res.json())
      .then(setContent);
  }, []);

  if (!content) return null;

  return (
    <section id="about" className="relative bg-[#0a2236] py-16 md:py-24 overflow-hidden" style={{ backgroundImage: 'url(/hexagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      <div className="absolute top-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 16px 32px -8px #0008'}} />
      <div className="absolute bottom-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 -16px 32px -8px #0008'}} />
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
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl text-teal-400 md:text-4xl font-heading font-bold mb-2">{content.heading}</h2>
        <p className="text-lg text-white font-semibold mb-4">{content.tagline}</p>
        <p className="text-gray-300 font-body mb-8">{content.description}</p>
        <ul className="text-left max-w-xl mx-auto mb-10 space-y-2">
          {content.bullets.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-gray-200">
              <span className="mt-1 w-2 h-2 rounded-full bg-teal-400 inline-block" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">Who We Are</h3>
        <p className="text-gray-300 font-body mb-10 max-w-2xl mx-auto">
          A lean, senior team that ships—no layers, no hand-offs, no bloat.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto mb-10 items-start">
          {team.map((member) => (
            <div key={member.name} className="bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-700">
              <div className="w-36 h-36 mb-5 rounded-full overflow-hidden border-4 border-teal-400 bg-gray-700">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                  style={{ objectPosition: 'top' }}
                  unoptimized
                />
              </div>
              <h4 className="text-2xl font-heading font-bold text-white mb-1">{member.name}</h4>
              <p className="text-teal-400 font-semibold text-lg mb-3">{member.title}</p>
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => toggleBio(member.name)}
                  className="flex items-center justify-center gap-1 w-full py-2 px-4 border border-teal-400 text-teal-400 hover:text-teal-300 hover:border-teal-300 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-800 rounded"
                  aria-expanded={expandedName === member.name}
                  aria-controls={`bio-${member.name.replace(/\s+/g, "-")}`}
                >
                  {expandedName === member.name ? (
                    <>
                      <ChevronUp className="w-4 h-4" aria-hidden />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" aria-hidden />
                      Read more
                    </>
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {expandedName === member.name && (
                    <motion.div
                      id={`bio-${member.name.replace(/\s+/g, "-")}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-300 font-body pt-5 pb-2 text-left">{member.bio}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Start a Conversation
          </Link>
        </div>
      </div>
    </section>
  );
} 