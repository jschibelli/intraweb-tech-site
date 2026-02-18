import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Implementation Services",
  description:
    "Hands-on workflow automation and agent integration. We build it, deploy it, and make sure it works.",
  alternates: {
    canonical: "/implementation",
  },
};

export default function ImplementationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
