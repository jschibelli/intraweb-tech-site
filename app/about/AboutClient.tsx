"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AboutSections from "@/components/AboutSections";
import EntranceReveal from "@/components/ui/EntranceReveal";

const team = [
  {
    name: "John Schibelli",
    title: "Founder / CEO",
    image: "/john_schibelli.jpg",
    bio: "John provides strategic vision, product direction, and final approvals for all projects. He is passionate about building innovative solutions that drive business growth.",
  },
  {
    name: "Chris Weston",
    title: "Senior Software Engineer",
    image: "/ctw_bio_photo.png",
    bio: "Chris architects scalable systems, drives full-stack development, and brings deep engineering expertise to every project.",
  },
];

export default function AboutClient() {
  return (
    <main className="bg-[#0a2236] min-h-screen text-white">
      {/* Hero Section */}
      <EntranceReveal>
        <section className="page-hero bg-[#0a2236]">
          {/* More visible SVG + teal overlay */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none">
            <div
              style={{
                backgroundImage: 'url(/pentagon-pattern.svg)',
                backgroundRepeat: 'repeat',
                backgroundSize: '80px 80px',
                opacity: 0.6,
                filter: 'contrast(2)'
              }}
              className="w-full h-full absolute inset-0"
            />
            <div className="w-full h-full absolute inset-0 bg-teal-500/20" />
          </div>
          <div className="page-hero-content container max-w-7xl mx-auto px-4 relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="page-hero-heading text-left md:text-center"
            >
              Our Mission
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="page-hero-subheading max-w-3xl text-left md:text-center mx-auto"
            >
              We exist to close the gap between strategy and delivery—so your AI investments actually pay off.
            </motion.p>
          </div>
        </section>
      </EntranceReveal>

      {/* Main Content Sections */}
      <EntranceReveal>
        <AboutSections />
      </EntranceReveal>

      {/* Who We Are Section */}
      <EntranceReveal>
        <section className="py-16 bg-[#13293d]">
          <div className="container max-w-4xl mx-auto px-4">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold mb-2 text-white text-center">Who We Are</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg max-w-2xl mb-12 text-teal-100 text-center mx-auto">
              A lean, senior team that ships—no layers, no hand-offs, no bloat.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-2xl mx-auto">
              {team.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-700"
                >
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
                  <h3 className="text-2xl font-heading font-bold text-white mb-1">{member.name}</h3>
                  <p className="text-teal-400 font-semibold text-lg mb-3">{member.title}</p>
                  <p className="text-gray-300 font-body">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </EntranceReveal>
    </main>
  );
} 