import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Request a diagnostic with IntraWeb Technologies to evaluate AI workflow automation opportunities for your operations.",
  alternates: {
    canonical: "/contact",
  },
};

const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/** Load reCAPTCHA Enterprise in head for /contact. ContactForm uses it when present, otherwise loads on submit. */

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
          strategy="beforeInteractive"
        />
      )}
      {children}
    </>
  );
}
