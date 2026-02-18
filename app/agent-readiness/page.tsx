"use client";

import Link from "next/link";
import EntranceReveal from "@/components/ui/EntranceReveal";
import {
  GitBranch,
  Database,
  Plug,
  Shield,
  Users,
  Target,
  ListChecks,
  AlertCircle,
  Calendar,
  FileSearch,
} from "lucide-react";

const evaluationAreas = [
  { icon: GitBranch, title: "Workflow Complexity", description: "Exception rates, approval chains, handoff points. We map the actual flow, not the documented one." },
  { icon: Database, title: "Data Quality & Accessibility", description: "Is the data automation needs actually available, clean, and accessible via API?" },
  { icon: Plug, title: "Integration Readiness", description: "APIs, webhooks, manual gaps. What can connect today versus what needs work." },
  { icon: Shield, title: "Governance Maturity", description: "Approval chains, audit trails, compliance requirements. What guardrails need to exist." },
  { icon: Users, title: "Change Absorption Capacity", description: "Can your team actually adopt new workflows? We assess realistic implementation pace." },
];

const deliverables = [
  { icon: Target, title: "Agent Readiness Score (0–100)", description: "A single metric that tells you how prepared your operations are for automation." },
  { icon: ListChecks, title: "Prioritized Automation Opportunities", description: "Ranked list of workflows with effort/impact scores." },
  { icon: AlertCircle, title: "Risk Register", description: "What will break, what's fragile, what needs fixing first." },
  { icon: Calendar, title: "90-Day Implementation Roadmap", description: "Sequenced plan you can execute immediately." },
  { icon: FileSearch, title: "Build vs. Buy Recommendations", description: "Where to use off-the-shelf tools versus custom development." },
];

export default function AgentReadinessPage() {
  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <EntranceReveal>
      <section className="page-hero" style={{ backgroundImage: "url(/circuit-pattern.svg)", backgroundRepeat: "repeat", backgroundSize: "auto" }}>
        <div className="page-hero-content max-w-4xl mx-auto px-4 text-left sm:text-center">
          <h1 className="page-hero-heading">Agent Readiness Assessment</h1>
          <p className="page-hero-subheading mb-4">Your organization isn&apos;t short on AI tools. It&apos;s short on the operational structure to actually use them.</p>
          <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto sm:text-center">A diagnostic that maps your workflows, scores automation opportunities, and delivers a 90-day implementation roadmap. 2–3 week delivery.</p>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-300 mb-12">Agent readiness isn&apos;t about picking vendors. It&apos;s about answering the questions that determine whether automation will stick or fail.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {["Which workflows can actually absorb automation?", "Where will agents fail because your data is a mess?", "What governance needs to exist before you deploy?"].map((q, i) => (
              <div key={i} className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 text-center">
                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teal-500 text-white text-sm font-semibold mb-4">0{i + 1}</span>
                <p className="text-white font-medium">{q}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-300">We assess, score, and sequence — so you invest in automation that sticks, not pilots that die.</p>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24 bg-[#111827]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center text-teal-400 mb-12">What We Evaluate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {evaluationAreas.map((area) => {
              const Icon = area.icon;
              return (
                <div key={area.title} className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 flex gap-4">
                  <Icon className="h-8 w-8 text-teal-400 shrink-0" />
                  <div>
                    <h3 className="text-xl font-heading font-semibold text-white mb-2">{area.title}</h3>
                    <p className="text-gray-300">{area.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center text-white mb-12">What You Get</h2>
          <ul className="space-y-6">
            {deliverables.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-4">
                  <Icon className="h-6 w-6 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-gray-300 mt-1">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24 bg-gradient-to-br from-teal-500/20 to-orange-500/20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Ready to see if we&apos;re the right fit?</h2>
          <p className="text-gray-200 mb-8">2–3 weeks. You&apos;ll know exactly where automation will drive savings—and have a roadmap to act on.</p>
          <Link href="/contact" className="inline-block px-8 py-3 rounded-md bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors">Book a Diagnostic Call</Link>
        </div>
      </section>
      </EntranceReveal>
    </main>
  );
}
