"use client";

import Link from "next/link";
import EntranceReveal from "@/components/ui/EntranceReveal";
import {
  Workflow,
  Bot,
  AlertTriangle,
  Monitor,
  FileText,
  Video,
  MessageSquare,
  ArrowRightLeft,
  Undo2,
  GraduationCap,
  Calendar,
  ListChecks,
  AlertCircle,
} from "lucide-react";

const buildItems = [
  { icon: Workflow, title: "Automated Workflow Sequences", description: "Approvals, routing, escalation—the multi-step processes that currently require manual coordination." },
  { icon: Bot, title: "Agent Integrations", description: "Connecting your AI tools to your systems with proper error handling and fallbacks." },
  { icon: AlertTriangle, title: "Exception Handling Logic", description: "What happens when automation fails. Alerts, fallbacks, human-in-the-loop escalation." },
  { icon: Monitor, title: "Monitoring & Alerting", description: "Dashboards and notifications so you know before it breaks, not after." },
  { icon: FileText, title: "Documentation & Handoff", description: "Everything written down so your team can maintain and extend it." },
];

const processItems = [
  { icon: Video, title: "Weekly implementation syncs", description: "30-minute standup to review progress, blockers, and priorities." },
  { icon: MessageSquare, title: "Async support via Slack or Teams", description: "Questions answered within 4 business hours." },
  { icon: ArrowRightLeft, title: "Staging → production deployment", description: "Every change tested before it hits your live systems." },
  { icon: Undo2, title: "Rollback protocols", description: "Every deployment can be reversed. No one-way doors." },
  { icon: GraduationCap, title: "Knowledge transfer built in", description: "Your team learns as we build. No black boxes." },
];

export default function ImplementationPage() {
  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <EntranceReveal>
      <section className="page-hero" style={{ backgroundImage: "url(/circuit-pattern.svg)", backgroundRepeat: "repeat", backgroundSize: "auto" }}>
        <div className="page-hero-content max-w-4xl mx-auto px-4 text-center">
          <h1 className="page-hero-heading">Implementation That Sticks</h1>
          <p className="page-hero-subheading">You&apos;ve seen the decks. You&apos;ve approved the pilots. Now you need someone to actually build it.</p>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-300">We handle the integration work that falls between your IT team and your operations team—the workflows, automations, and agent configurations that turn AI tools into operational savings.</p>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24 bg-[#111827]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center text-teal-400 mb-12">What We Build</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {buildItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 text-center">
                  <Icon className="h-8 w-8 text-teal-400 mx-auto mb-3" />
                  <h3 className="text-xl font-heading font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
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
          <h2 className="text-3xl font-heading font-bold text-center text-white mb-12">How We Work</h2>
          <ul className="space-y-6">
            {processItems.map((item) => {
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
      <section className="py-16 md:py-24 bg-[#111827]">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center text-white mb-12">The Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 text-center">
              <Calendar className="h-8 w-8 text-teal-400 mx-auto mb-3" />
              <h3 className="text-xl font-heading font-semibold text-white mb-4">The Commitment</h3>
              <ul className="text-gray-300 space-y-2">
                <li>6-month minimum term</li>
                <li>Scope defined by diagnostic findings</li>
                <li>Month-to-month after initial term</li>
              </ul>
            </div>
            <div className="bg-[#181f2a] border border-gray-700 rounded-xl p-6 text-center">
              <ListChecks className="h-8 w-8 text-teal-400 mx-auto mb-3" />
              <h3 className="text-xl font-heading font-semibold text-white mb-4">What&apos;s Included</h3>
              <ul className="text-gray-300 space-y-2">
                <li>Up to 3 active workflow implementations</li>
                <li>Weekly sync calls</li>
                <li>Unlimited async support</li>
                <li>All documentation and handoff materials</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      </EntranceReveal>

      <EntranceReveal>
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-[#181f2a] border border-orange-500/50 rounded-xl p-8 text-center">
            <AlertCircle className="h-10 w-10 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-semibold text-white mb-2">Implementation requires a completed diagnostic</h3>
            <p className="text-gray-300 mb-4">We need to understand your operations before we can build effectively. The diagnostic ensures we&apos;re solving the right problems in the right order.</p>
            <Link href="/agent-readiness" className="text-teal-400 font-medium hover:text-teal-300 transition-colors">Learn about the diagnostic →</Link>
          </div>
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
