import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the IntraWeb team combining senior implementation leadership with AI-enabled delivery to execute operational automation.",
  alternates: {
    canonical: "/team",
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
