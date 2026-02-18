"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const notItems = [
  "A consultancy that stops at recommendations",
  "A dev shop that builds without understanding operations",
  "A platform vendor optimizing for lock-in",
];

const areItems = [
  "The implementation layer between your AI tools and your P&L",
  "Hands-on workflow build and deployment",
  "Tool-agnostic and outcome-focused",
];

export default function Differentiators() {
  return (
    <section
      id="differentiators"
      className="relative py-16 md:py-24 bg-[#1f2937]"
      style={{
        backgroundImage: "url('/web-structure.svg')",
        backgroundRepeat: "repeat",
        backgroundSize: "360px 190px",
        backgroundPosition: "center -190px",
      }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-sm font-medium uppercase tracking-wider text-teal-400 text-center mb-2">
          WHAT SETS US APART
        </p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white mb-12">
          Not a Consultancy. Not a Dev Shop.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 md:p-8 border-l-4 border-l-teal-500"
          >
            <h3 className="text-2xl font-heading font-semibold text-white mb-6">
              What We&apos;re Not
            </h3>
            <ul className="space-y-4">
              {notItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="h-6 w-6 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 md:p-8 border-l-4 border-l-teal-500"
          >
            <h3 className="text-2xl font-heading font-semibold text-white mb-6">
              What We Are
            </h3>
            <ul className="space-y-4">
              {areItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-6 w-6 text-teal-400 shrink-0 mt-0.5" />
                  <span className="text-gray-200">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
