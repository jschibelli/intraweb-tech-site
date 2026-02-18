import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Process",
  description:
    "See IntraWeb's two-stage delivery model: agent readiness diagnostic followed by hands-on implementation retainer services.",
  alternates: {
    canonical: "/process",
  },
};

export default function ProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
