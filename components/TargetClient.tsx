"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const scenarios = [
  {
    headline: "Your team burns hours on manual handoffs",
    description:
      "Approvals, status updates, and follow-ups eat your week. Work falls through the cracks because the process lives in people's heads, not in systems.",
  },
  {
    headline: "You've tried AI tools but the ROI isn't there",
    description:
      "You bought licenses, ran pilots, but nothing stuck. The gap between the tool and your actual workflow is too wide for generic solutions to bridge.",
  },
  {
    headline: "Growth is creating coordination overhead",
    description:
      "What worked at 20 people breaks at 80. You're adding process debt faster than headcount, and it's slowing everything down.",
  },
  {
    headline: "You have a plan but need someone to build it",
    description:
      "You know where you want to go with AI or automation. Now you need someone who can actually build it—and make it work inside your operations.",
  },
];

export default function TargetClient() {
  return (
    <section id="target-client" className="relative py-16 md:py-24 bg-[#111827]">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-white mb-2">
          Sound Familiar?
        </h2>
        <p className="text-lg text-teal-100 text-center mb-12">
          These are the problems we solve every day.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario, i) => (
            <motion.div
              key={scenario.headline}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 md:p-8 border-t-2 border-t-teal-500 shadow-lg"
            >
              <h3 className="text-xl font-heading font-semibold text-white mb-3">
                {scenario.headline}
              </h3>
              <p className="text-gray-300 font-body leading-relaxed">
                {scenario.description}
              </p>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="text-center mt-12"
        >
          <p className="text-lg text-gray-300 mb-5">
            If any of this hits home, let&apos;s talk.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Start a Conversation
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
