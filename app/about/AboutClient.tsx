"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AboutSections from "@/components/AboutSections";

export default function AboutClient() {
  return (
    <main className="bg-[#0a2236] min-h-screen text-white">
      {/* Hero Section */}
      <section className="py-20 relative bg-[#0a2236] overflow-hidden">
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
        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold mb-4 text-teal-400 text-left md:text-center"
          >
            About IntraWeb Technologies
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl max-w-3xl text-teal-100 text-left md:text-center mx-auto"
          >
            We build high-performance web solutions that blend innovative design with rock-solid technology. Delivering digital experiences that drive real business impact.
          </motion.p>
        </div>
      </section>

      {/* Main Content Sections */}
      <AboutSections />

      {/* Team & Hybrid Model Section */}
      <section className="py-16 bg-[#13293d]">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">Team & Hybrid Model</motion.h2>
          <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }} className="text-2xl font-semibold mb-8 text-teal-400 text-center">Meet Our Team</motion.h3>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg max-w-4xl mb-10 text-teal-100 text-center mx-auto">
            We combine world-class human talent with intelligent AI collaborators to deliver outcomes neither could achieve alone.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Human Experts */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-[#1a2e3b] p-8 rounded-lg shadow-sm border border-teal-900">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-teal-900 rounded-full flex items-center justify-center">
                  <span className="text-teal-400 text-2xl">👤</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-center mb-4 text-white">Human Experts</h4>
              <p className="text-center text-teal-100">
                Our designers, developers, and strategists bring deep industry knowledge, creative problem-solving, and personal accountability.
              </p>
            </motion.div>
            {/* AI Agents */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.05 }} className="bg-[#1a2e3b] p-8 rounded-lg shadow-sm border border-teal-900">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-teal-900 rounded-full flex items-center justify-center">
                  <span className="text-teal-400 text-2xl">🤖</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-center mb-4 text-white">AI Agents</h4>
              <p className="text-center text-teal-100">
                Specialized AI collaborators accelerate ideation, generate production-ready code snippets, analyze performance, and surface design refinements in real time.
              </p>
            </motion.div>
            {/* Seamless Collaboration */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-[#1a2e3b] p-8 rounded-lg shadow-sm border border-teal-900">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-teal-900 rounded-full flex items-center justify-center">
                  <span className="text-teal-400 text-2xl">🤝</span>
                </div>
              </div>
              <h4 className="text-xl font-bold text-center mb-4 text-white">Seamless Collaboration</h4>
              <p className="text-center text-teal-100">
                Our hybrid model combines the best of both worlds—human creativity and AI efficiency—to deliver exceptional results faster than ever.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
} 