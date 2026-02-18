'use client'

import { Gauge, Rocket, BarChart3, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

const focusAreas = [
  {
    icon: Gauge,
    title: "Client satisfaction",
    description: "We work to clear outcomes and feedback so projects stay on track.",
  },
  {
    icon: Rocket,
    title: "Performance",
    description: "Implementation is tied to conversion and business goals, not just launch.",
  },
  {
    icon: BarChart3,
    title: "Growth",
    description: "We help you measure and improve organic reach and traffic over time.",
  },
  {
    icon: ShieldCheck,
    title: "Reliability",
    description: "Scoped work, clear timelines, and delivery within budget.",
  },
]

export function StatsSection() {
  return (
    <section className="w-full bg-gray-700 py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-700/95" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4 text-teal-400">
            What we focus on
          </h2>
          <p className="font-sans text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto text-teal-100">
            Clear outcomes, scoped work, and results you can measure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {focusAreas.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div 
                className="flex flex-col p-8 rounded-xl shadow-lg bg-gray-800 border border-gray-700 border-t-4 border-teal-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="p-4 rounded-full bg-gray-700 text-teal-400 border-2 border-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                    <item.icon size={40} />
                  </span>
                  <span className="font-heading font-bold text-xl text-white">
                    {item.title}
                  </span>
                </div>
                <p className="font-sans text-gray-300">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 