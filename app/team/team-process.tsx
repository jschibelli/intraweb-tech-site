"use client";
import { Sparkles, User, Bot, RefreshCcw, ShieldCheck, Zap } from "lucide-react";

const items = [
  {
    icon: <User className="text-teal-400" size={32} />,
    title: "Human-Led Strategy",
    desc: "Projects begin with expert humans who define goals, set vision, and guide every phase from kickoff to delivery.",
    color: "bg-teal-900/60"
  },
  {
    icon: <Bot className="text-orange-400" size={32} />,
    title: "AI-Powered Execution",
    desc: "AI agents handle layout, accessibility, optimization, and integration — always within our approved tech stack.",
    color: "bg-orange-900/60"
  },
  {
    icon: <RefreshCcw className="text-teal-400" size={32} />,
    title: "Continuous Feedback Loop",
    desc: "Human leads review and refine AI output in real time — ensuring high-quality results without slowdowns.",
    color: "bg-teal-900/60"
  },
  {
    icon: <ShieldCheck className="text-orange-400" size={32} />,
    title: "Transparent Oversight",
    desc: "Every AI agent is clearly identified and supervised. Humans remain accountable for every deliverable.",
    color: "bg-orange-900/60"
  },
  {
    icon: <Zap className="text-teal-400" size={32} />,
    title: "Why It Works",
    desc: "Faster iterations. Cleaner code. Smarter designs. Our hybrid team model helps you ship faster with confidence.",
    color: "bg-teal-900/60"
  },
  {
    icon: <Sparkles className="text-orange-400" size={32} />,
    title: "Built In-House",
    desc: "Every AI agent is built and trained in-house by our engineering team, ensuring alignment with your business goals.",
    color: "bg-orange-900/60"
  },
];

export function TeamProcess() {
  return (
    <section className="bg-[#192132] py-20 border-t border-b border-gray-900">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Our Hybrid Team Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            At IntraWeb Technologies, human creativity leads — and AI agents execute with precision. Here&apos;s how our collaboration model delivers faster, smarter results.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="bg-[#232b3d] rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-800"
            >
              <span className={`mb-4 w-14 h-14 flex items-center justify-center rounded-full ${item.color}`}>
                {item.icon}
              </span>
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">{item.title}</h3>
              <p className="text-gray-300 text-base font-body leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 