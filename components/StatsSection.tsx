'use client'

import { Card, CardContent, CardHeader } from "./ui/card"
import { Button } from "./ui/Button"
import { Gauge, Rocket, BarChart3, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  {
    icon: Gauge,
    metric: "Fewer Handoffs",
    description: "Work moves through the organization with fewer manual handoffs and explicit transitions",
    category: "Workflow Design"
  },
  {
    icon: Rocket,
    metric: "Less Coordination",
    description: "Fewer decisions require meetings or escalations. Teams spend less time coordinating and more time executing",
    category: "Operational Efficiency"
  },
  {
    icon: BarChart3,
    metric: "Supported Automation",
    description: "Automation supports the workflow instead of fighting it. Tools reduce friction rather than create new dependencies",
    category: "Smart Tooling"
  },
  {
    icon: ShieldCheck,
    metric: "Easier to Run",
    description: "The business becomes easier to run—not because people work harder, but because the system carries more of the load",
    category: "Sustained Improvement"
  }
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
            What Changes in Practice
          </h2>
          <p className="font-sans text-lg md:text-xl text-center mb-12 max-w-2xl mx-auto text-teal-100">
            The goal isn't transformation theater. It's day-to-day work that runs with less friction, less risk, and fewer surprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat, index) => (
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
                    <stat.icon size={40} />
                  </span>
                  <span className="font-heading font-bold text-2xl text-white">
                    {stat.metric}
                  </span>
                </div>
                <div>
                  <p className="font-sans mb-4 text-gray-300">
                    {stat.description}
                  </p>
                  <span className="text-sm uppercase text-teal-400 font-medium inline-flex items-center gap-1">
                    <span className="text-orange-500">→</span> {stat.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 