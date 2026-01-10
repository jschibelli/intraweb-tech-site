"use client";

import { Project } from "@/types/project";
import { motion } from "framer-motion";
import { useState } from "react";

interface ProcessTimelineProps {
  project: Project;
}

export default function ProcessTimeline({ project }: ProcessTimelineProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);


  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Our Process
          </h2>
          {project.processSummary && (
            <p className="text-lg text-teal-100 max-w-2xl mx-auto mb-2">{project.processSummary}</p>
          )}
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            A step-by-step journey of how we brought this project to life
          </p>
        </div>

        {/* Mobile: Accordion List */}
        <div className="block md:hidden">
          {project.processSteps.map((step, index) => (
            <div key={step.title} className="mb-4">
              <button
                className="w-full flex items-center gap-4 p-4 bg-gray-900 rounded-2xl shadow-lg focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                style={{ minHeight: 44 }}
              >
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold mr-2">
                  {index + 1}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-heading font-bold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-teal-200">{step.duration}</p>
                </div>
                <span className="text-teal-400 font-bold">{openIndex === index ? '-' : '+'}</span>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-gray-800 rounded-b-2xl text-teal-100">
                  {step.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: Alternating Timeline */}
        <div className="hidden md:block relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-teal-800" />
          <div className="space-y-8">
            {project.processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} ${index === project.processSteps.length - 1 ? 'mb-0' : ''}`}
              >
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-orange-500 border-4 border-gray-900 z-10" />
                <div
                  className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}
                >
                  <div className="bg-gray-900 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-teal-900 flex items-center justify-center">
                        <span className="text-teal-400 font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-heading font-bold text-white">
                          {step.title}
                        </h3>
                        <p className="text-sm text-teal-200">{step.duration}</p>
                      </div>
                    </div>
                    <p className="text-teal-100">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 