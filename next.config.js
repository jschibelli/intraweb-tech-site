const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Content-Security-Policy: script-src includes 'unsafe-eval' so reCAPTCHA Enterprise
 * (https://www.google.com/recaptcha/enterprise.js) can run. Google's script uses eval internally.
 */
const cspScriptSrc = [
  "'self'",
  "'unsafe-inline'", // Next.js / React
  "'unsafe-eval'",  // required by reCAPTCHA Enterprise script
  "https://www.google.com",
  "https://www.gstatic.com",
  "https://www.googletagmanager.com",
  "https://js.hs-scripts.com", // HubSpot (loaded after marketing consent)
].join(" ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src ${cspScriptSrc}`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://www.google.com https://www.recaptcha.net https://www.gstatic.com https://www.googletagmanager.com https://analytics.google.com https://*.google-analytics.com https://js.hs-scripts.com https://track.hubspot.com https://api.hubapi.com",
              "frame-src https://www.google.com https://www.recaptcha.net",
            ].join("; "),
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  // Turbopack config to silence the error in Next.js 16
  // The webpack config above is still used when building with --webpack flag
  turbopack: {},
};

module.exports = withBundleAnalyzer(nextConfig); 