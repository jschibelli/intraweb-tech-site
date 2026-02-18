"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, Compass, Shield, Network } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  TrendingUp: TrendingUp,
  Compass: Compass,
  Shield: Shield,
  Network: Network,
};

type Service = {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/services.json")
      .then((res) => res.json())
      .then(setServices);
  }, []);

  return (
    <section id="services" className="bg-[#111827] text-white py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-10 text-teal-400 text-center">Hands-on workflow automation and agent integration</h2>
        {/* <p className="text-lg md:text-xl text-teal-100 text-left md:text-center mb-6">Comprehensive technology solutions to drive your business forward</p> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {services.map((service, i) => {
            const Icon = iconMap[service.icon];
            return (
              <motion.div
                key={service.title}
                className="flex flex-col items-center text-center p-8 rounded-xl shadow-lg bg-[#181f2a] border border-gray-800 border-t-4 border-teal-500 hover:shadow-2xl transition-shadow group cursor-pointer"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, type: 'spring' }}
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(21,184,161,0.18)' }}
              >
                <span className="mb-4 p-4 rounded-full bg-[#111827] text-teal-400 border-2 border-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <Icon size={40} />
                </span>
                <h3 className="text-xl font-heading font-semibold mb-2 text-white text-left md:text-center">{service.title}</h3>
                <p className="text-base font-body text-gray-300 mb-0">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-center">
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