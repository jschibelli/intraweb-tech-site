import "./globals.css";
import Navbar from "../components/shared/navbar";
import { Footer } from "../components/Footer";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { CookieConsentBanner } from "../components/CookieConsentBanner";

export const metadata = {
  title: "IntraWeb Technologies",
  description: "Landing page for IntraWeb Technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
