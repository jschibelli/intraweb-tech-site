import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a diagnostic with IntraWeb Technologies to evaluate AI workflow automation opportunities for your operations.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
