import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Intake",
  description:
    "Website project intake form for IntraWeb Technologies. Share goals, pages, design preferences, and timelines so we can scope accurately.",
  alternates: {
    canonical: "/website-intake",
  },
};

export default function WebsiteIntakeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

