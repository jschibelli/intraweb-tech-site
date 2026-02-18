import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Read answers to common questions about IntraWeb's diagnostic, implementation process, scope, and engagement model.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
