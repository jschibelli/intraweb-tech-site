import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Explore careers at IntraWeb Technologies and learn about open opportunities to help build AI implementation systems.",
  alternates: {
    canonical: "/careers",
  },
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
