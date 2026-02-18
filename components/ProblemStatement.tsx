"use client";

import { motion } from "framer-motion";

export default function ProblemStatement() {
  return (
    <section id="problem" className="py-16 md:py-24 bg-[#111827]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-teal-400 mb-2">
          THE PROBLEM
        </p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-8">
          The Implementation Gap
        </h2>
        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Your team bought the tools. You ran the pilots. You&apos;re still
            drowning in Slack threads and manual handoffs.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The problem isn&apos;t AI capability—it&apos;s that nobody owns the
            integration. Your ERP vendor won&apos;t do it. Your IT team is
            underwater. Consultants hand you a deck and disappear.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-teal-400 font-semibold font-heading text-xl"
          >
            We stick around until it works.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
