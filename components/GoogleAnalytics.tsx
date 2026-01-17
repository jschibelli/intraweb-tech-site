"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Cookies from "js-cookie";

const GA_MEASUREMENT_ID = "G-GTDQWE3CH6";

export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check if user has given analytics consent
    const checkConsent = () => {
      const analyticsConsent = Cookies.get("cookie_consent_analytics");
      setHasConsent(analyticsConsent === "true");
    };

    // Check initially
    checkConsent();

    // Listen for cookie changes (when user grants consent)
    const interval = setInterval(checkConsent, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only load GA if user has consented
  if (!hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}