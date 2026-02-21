import "./globals.css";
import { Montserrat, Roboto } from "next/font/google";
import Navbar from "../components/shared/navbar";
import { Footer } from "../components/Footer";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { CookieConsentBanner } from "../components/CookieConsentBanner";
import type { Metadata } from "next";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-montserrat",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://intrawebtech.com"),
  title: {
    default: "IntraWeb Technologies | AI Implementation That Actually Works",
    template: "%s | IntraWeb Technologies",
  },
  description:
    "We help SMBs turn AI tool adoption into actual operational savings. 95% of AI pilots fail—we fix that.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "IntraWeb Technologies",
    locale: "en_US",
    url: "https://intrawebtech.com",
    title: "IntraWeb Technologies | AI Implementation That Actually Works",
    description:
      "We help SMBs turn AI tool adoption into actual operational savings. 95% of AI pilots fail—we fix that.",
    // og:image is provided by app/opengraph-image.tsx (file convention)
  },
  twitter: {
    card: "summary_large_image",
    title: "IntraWeb Technologies | AI Implementation That Actually Works",
    description:
      "We help SMBs turn AI tool adoption into actual operational savings. 95% of AI pilots fail—we fix that.",
    // twitter:image inherited from Open Graph image (opengraph-image.tsx)
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IntraWeb Technologies",
    url: "https://intrawebtech.com",
    description:
      "Operational consulting for AI implementation. We help SMBs turn AI tool adoption into actual operational savings.",
    address: {
      "@type": "PostalAddress",
      addressRegion: "NJ",
      addressCountry: "US",
    },
  };

return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${roboto.className} ${montserrat.variable} ${roboto.variable} antialiased`}>
        <GoogleAnalytics />
        <Navbar />
        {children}
        <Footer />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
