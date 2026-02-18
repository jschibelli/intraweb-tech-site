import "./globals.css";
import Navbar from "../components/shared/navbar";
import { Footer } from "../components/Footer";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { CookieConsentBanner } from "../components/CookieConsentBanner";

export const metadata = {
  metadataBase: new URL("https://intrawebtech.com"),
  title: {
    default: "IntraWeb Technologies | AI Implementation That Actually Works",
    template: "%s | IntraWeb Technologies",
  },
  description:
    "We help SMBs turn AI tool adoption into actual operational savings. 95% of AI pilots fail—we fix that.",
  openGraph: {
    type: "website",
    siteName: "IntraWeb Technologies",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
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
      <body className="antialiased">
        <GoogleAnalytics />
        <Navbar />
        {children}
        <Footer />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
