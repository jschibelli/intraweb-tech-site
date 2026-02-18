import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Readiness Assessment",
  description:
    "A diagnostic that maps your workflows, scores automation opportunities, and delivers a 90-day implementation roadmap. 2-3 week delivery.",
  alternates: {
    canonical: "/agent-readiness",
  },
};

export default function AgentReadinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
