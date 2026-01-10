"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Tech {
  name: string;
  logo: string;
  alt: string;
}

export default function TechStack() {
  const [tech, setTech] = useState<Tech[]>([]);

  useEffect(() => {
    fetch("/tech-stack.json")
      .then((res) => res.json())
      .then(setTech);
  }, []);

  return (
    <section id="tech-stack" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-10 text-white">Technology Stack</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
          {tech.map((item, i) => (
            <motion.div
              key={item.name}
              className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-700"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Image
                src={item.logo}
                alt={item.alt}
                width={48}
                height={48}
                className="h-12 w-auto mb-2 object-contain"
              />
              <span className="text-sm font-body text-teal-400 mt-2">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 