"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Pen, Code, Rocket, LifeBuoy } from "lucide-react";

const iconMap = {
  Search,
  Pen,
  Code,
  Rocket,
  LifeBuoy,
};

interface Step {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
}

export default function Process() {
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    fetch("/process.json")
      .then((res) => res.json())
      .then(setSteps);
  }, []);

  return (
    <section id="process" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-10 text-white">How It Works</h2>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-12">
          {steps.map((step, i) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={i}
                className="relative z-10 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="mb-4 z-10">
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-teal-500 text-white shadow-md border-4 border-gray-700">
                    {Icon ? <Icon size={28} color="white" /> : i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-gray-300 font-body leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/contact"
            className="px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Start with a Diagnostic
          </Link>
        </div>
      </div>
    </section>
  );
} 